import { GoogleGenAI, Chat, Part, FunctionDeclaration, Type } from "@google/genai";
import { Layer, ChatMessage, LayerType, GeminiResponse, AiAction, ModifierType } from "../types";

// --- Types ---
export interface GeminiRequestOptions {
  useThinking?: boolean;
  useFast?: boolean;
  imageSize?: '1K' | '2K' | '4K';
  selectedLayer?: Layer | null;
  uploadedImage?: string; // base64
}

// --- Initialization ---
// FIX: Refactored to align with guideline of exclusively using process.env.API_KEY.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper: Fetch image URL to Base64
export const urlToBase64 = async (url: string): Promise<string> => {
  if (!url) return "";
  if (url.startsWith('data:')) {
    const parts = url.split(',');
    return parts.length > 1 ? parts[1] : '';
  }
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return "";
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image to base64", e);
    return "";
  }
};

// --- Core Service Function ---
export const processGeminiRequest = async (
  userMessage: string,
  contextLayers: Layer[],
  options: GeminiRequestOptions
): Promise<GeminiResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { text: "API Key missing." };

  const promptLower = userMessage.toLowerCase();
  
  if (promptLower.startsWith("generate") || promptLower.includes("create an image")) {
    // FIX: Removed apiKey argument.
    return await handleImageGeneration(userMessage, options.imageSize || '1K');
  }

  if (options.selectedLayer && options.selectedLayer.type === LayerType.IMAGE && 
     (promptLower.includes("edit") || promptLower.includes("remove") || promptLower.includes("add"))) {
       // FIX: Removed apiKey argument.
       return await handleImageEditing(userMessage, options.selectedLayer);
  }

  if (options.uploadedImage) {
    // FIX: Removed apiKey argument.
    return await handleImageAnalysis(userMessage, options.uploadedImage);
  }

  // Node manipulation is a form of chat/reasoning now
  // FIX: Removed apiKey argument.
  return await handleChat(userMessage, contextLayers, options);
};

// --- Handlers ---

// FIX: Removed apiKey argument.
const handleImageGeneration = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<GeminiResponse> => {
  if ((window as any).aistudio) {
    if (!await (window as any).aistudio.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }
  }
  // FIX: Per guideline, create new instance right before API call for models that use API key selection.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { imageSize: size, aspectRatio: "1:1" } }
    });
    let generatedImage = null, text = "Here is your generated image.";
    response.candidates?.[0]?.content?.parts?.forEach(part => {
      if (part.inlineData) generatedImage = part.inlineData.data;
      else if (part.text) text = part.text;
    });
    return { text, generatedImage, actionType: 'CREATE_LAYER' };
  } catch (error) {
    return { text: "Failed to generate image." };
  }
};

// FIX: Removed apiKey argument.
const handleImageEditing = async (prompt: string, layer: Layer): Promise<GeminiResponse> => {
  const ai = getAIClient();
  const base64Image = await urlToBase64(layer.content || '');
  if (!base64Image) return { text: "Could not process layer image." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64Image } }, { text: prompt }] }
    });
    let modifiedImage = null, text = "Image updated.";
    response.candidates?.[0]?.content?.parts?.forEach(part => {
        if (part.inlineData) modifiedImage = part.inlineData.data;
        else if (part.text) text = part.text;
    });
    return { text, generatedImage: modifiedImage, actionType: 'UPDATE_LAYER' };
  } catch (error) {
    return { text: "Failed to edit image." };
  }
};

// FIX: Removed apiKey argument.
const handleImageAnalysis = async (prompt: string, base64Image: string): Promise<GeminiResponse> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: prompt || "Analyze this image." }] }
    });
    return { text: response.text || "Analysis complete." };
  } catch (error) {
    return { text: "Failed to analyze image." };
  }
};

// --- AI Function Calling Implementation ---
const tools: FunctionDeclaration[] = [
    {
        name: 'updateModifierParams',
        parameters: {
            type: Type.OBJECT,
            description: 'Update one or more parameters of a specific modifier node on the selected layer.',
            properties: {
                modId: { type: Type.STRING, description: 'The ID of the modifier to update (e.g., "mod-123").' },
                params: { 
                    type: Type.OBJECT, 
                    description: 'An object of parameters to update, e.g., {"intensity": 80, "scanlines": 20}. Param names are camelCase.',
                    properties: {} // Allow any property
                },
            },
            required: ['modId', 'params'],
        },
    },
    {
        name: 'addModifier',
        parameters: {
            type: Type.OBJECT,
            description: 'Add a new modifier to the selected layer.',
            properties: {
                type: { type: Type.STRING, description: 'The type of modifier to add, from the available ModifierType enum (e.g., "BLOOM", "GLITCH").' },
            },
            required: ['type'],
        },
    },
    {
        name: 'createConnection',
        parameters: {
            type: Type.OBJECT,
            description: 'Create a visual connection (wire) between two modifier parameters.',
            properties: {
                fromModId: { type: Type.STRING, description: 'The ID of the source modifier.' },
                fromPort: { type: Type.STRING, description: 'The name of the output parameter port (e.g., "Intensity").' },
                toModId: { type: Type.STRING, description: 'The ID of the destination modifier.' },
                toPort: { type: Type.STRING, description: 'The name of the input parameter port (e.g., "Amount").' },
            },
            required: ['fromModId', 'fromPort', 'toModId', 'toPort'],
        }
    }
];

// FIX: Removed apiKey argument.
const handleChat = async (prompt: string, layers: Layer[], options: GeminiRequestOptions): Promise<GeminiResponse> => {
  const ai = getAIClient();
  
  // FIX: Corrected model name 'gemini-2.5-flash-lite-latest' to 'gemini-flash-lite-latest' per guidelines.
  let modelName = options.useFast ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';
  let systemInstruction = `You are Mod-Weave Core, an AI design assistant. You can manipulate the design by calling functions. The user is currently interacting with a design canvas.`;
  
  const config: any = {};
  if (options.useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  // If a layer is selected, provide its context to the AI
  if (options.selectedLayer) {
      const { id, name, modifiers, connections } = options.selectedLayer;
      const context = {
          selectedLayer: {
              id,
              name,
              modifiers: modifiers.map(m => ({ id: m.id, type: m.type, name: m.name, params: m.params })),
              connections
          }
      };
      systemInstruction += `\n\nCURRENT CONTEXT:\nThe user has selected the layer named "${name}" (id: ${id}). Its current modifier stack is: ${JSON.stringify(context.selectedLayer.modifiers, null, 2)}.`;
  }

  config.systemInstruction = systemInstruction;

  try {
    const chat = ai.chats.create({
      model: modelName,
      config,
      tools: [{ functionDeclarations: tools }],
    });

    const response = await chat.sendMessage({ message: prompt });
    
    // Check for Function Calls
    if (response.functionCalls && response.functionCalls.length > 0) {
        const actionPayload: AiAction[] = [];
        for (const call of response.functionCalls) {
            if (call.name === 'updateModifierParams') {
                actionPayload.push({ action: 'update_modifier_params', ...call.args as any });
            } else if (call.name === 'addModifier') {
                const type = call.args.type as keyof typeof ModifierType;
                if(ModifierType[type]) { // Ensure it's a valid type
                    actionPayload.push({ action: 'add_modifier', type: ModifierType[type] });
                }
            } else if (call.name === 'createConnection') {
                actionPayload.push({ action: 'create_connection', ...call.args as any });
            }
        }
        
        return {
            text: response.text || "Okay, I've made the requested changes.",
            actionType: 'MANIPULATE_NODES',
            actionPayload,
        };
    }

    return { text: response.text || "I'm not sure how to respond to that." };

  } catch (error) {
    console.error("Chat/FunctionCall Error", error);
    return { text: "An error occurred while processing your request." };
  }
};
