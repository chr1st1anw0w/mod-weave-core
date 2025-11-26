
import { GoogleGenAI, Type, Content, Part } from "@google/genai";
import { AnalysisResult, GenerationSettings, ChatMessage, AnalysisMode } from "../types";

// Initialize Gemini API with the specific key requested
const apiKey = (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || 'AIzaSyDc47kvvik7n3q41AN_DfT6Aw9KHNFCjtI';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the advanced Gemini AI core engine for "CanvasCode Pro," a next-generation infinite canvas design tool. Your primary goal is to perform intelligent UI analysis on user-provided images and generate high-quality, production-ready code.

## Application Inputs:
1. **Selected Canvas Image**: A single UI image.
2. **User Instructions**: Specific requests (e.g., "Use blue colors").
3. **Configuration**: Technical preferences (Framework, Device, Type).

## Core Workflow & Output Format:
You MUST return a JSON object with exactly three fields: "analysis", "code", and "figmaGuide".

### Field 1: "analysis" (Markdown String)
Perform detailed UI analysis:
- **Overall Style**: e.g., Modern, Minimalist.
- **Color Palette**: HEX codes.
- **Typography**: Fonts, weights.
- **Layout & Structure**: Grid, Flex, etc.
- **Component Styles**: Buttons, Inputs, Cards details.
- **Spacing & Rhythm**: Padding/Margin usage.

### Field 2: "code" (String)
Generate a single, clean code string.
- **Technology**: Adhere to the requested configuration (default HTML5 + Tailwind CSS).
- **Structure**: Semantic tags.
- **Style**: ALL styling via Tailwind classes. No external CSS.
- **Content**: The full code, ready to be pasted.

### Field 3: "figmaGuide" (Markdown String)
Simulate "Convert to Figma" output. Use Traditional Chinese (繁體中文).
- Heading: 🚀 **Figma 匯入指南 (透過程式碼)**
- Explicitly recommend: **"HTML to Design"** plugin.
- Steps (in Chinese):
    1. **複製程式碼**
    2. **開啟 Figma**
    3. **安裝外掛** (HTML to Design)
    4. **執行外掛**
    5. **貼上程式碼**
    6. **點擊匯入**

Ensure the response is valid JSON.
`;

const WIREFRAME_SYSTEM_INSTRUCTION = `
You are a specialized "Wireframe Generator" for CanvasCode Pro.
Your goal is to convert the input UI image into a Low-Fidelity Wireframe using HTML and Tailwind CSS.

## Wireframe Rules:
1. **Color**: Use ONLY grayscale (bg-gray-100, bg-gray-300, border-gray-400). No colors.
2. **Images**: Replace all images with gray placeholder rectangles containing an icon or text label "Image".
3. **Text**: Use "Inter" or system-ui font. Keep text simple and blocky.
4. **Structure**: Focus heavily on Layout (Flexbox/Grid), Padding, and Margins.
5. **Elements**: represent buttons as rounded gray rectangles, inputs as bordered boxes.

## Output Format:
Return the same JSON structure:
- "analysis": Brief structural analysis.
- "code": The grayscale wireframe HTML/Tailwind code.
- "figmaGuide": Same as standard.
`;

const DESIGN_SYSTEM_INSTRUCTION = `
You are a "Design System Architect". Your goal is to extract a Tailwind CSS configuration and Style Guide from the UI image.

## Output Requirements:
1. **Analysis**: List all distinct colors (Primary, Secondary, Accent, Surface) with closest Tailwind color names. List font sizes, radii, and shadows.
2. **Code**: Return a 'tailwind.config.js' content block inside a <script> tag or just the JS object. Also include a HTML section displaying the color palette and typography ramp visually.
3. **Figma Guide**: Standard guide.
`;

const STYLE_ANALYSIS_INSTRUCTION = `
You are a "Visual Design Critic". Your goal is to analyze the aesthetic qualities of the UI.

## Output Requirements:
1. **Analysis**: Analyze the 'Mood', 'Target Audience', 'Visual Hierarchy', and 'Artistic Style' (e.g., Swiss, Brutalist, Glassmorphism). Provide keywords for inspiration.
2. **Code**: Generate a simple HTML card summarizing these stylistic traits with visual examples (CSS gradients or font pairings that match the style).
3. **Figma Guide**: Standard guide.
`;

const UX_AUDIT_INSTRUCTION = `
You are a "Senior UX Researcher & Accessibility Expert". Your goal is to audit the provided UI for usability, accessibility, and user experience improvements.

## Output Requirements:
1. **Analysis**:
   - **Accessibility (a11y)**: Check contrast ratios, tap targets, text readability.
   - **Usability**: Identify potential friction points, unclear navigation, or cognitive load issues.
   - **Heuristics**: Evaluate against Nielsen's 10 Usability Heuristics (e.g., Consistency, Error Prevention).
2. **Code**: Generate a detailed HTML Report formatted as a clean, readable document (using Tailwind typography) that lists the issues found and recommended fixes. Use color coding (Green for Good, Red for Issues, Yellow for Warnings).
3. **Figma Guide**: Standard guide.
`;

const CHAT_SYSTEM_INSTRUCTION = `
You are "Gemini," the intelligent design assistant for CanvasCode Pro. 
You help users by analyzing their design elements (images, text, wireframes) on the canvas.
Users may tag images using @ImageName. When they do, you will receive the image data.
Be helpful, concise, and design-focused. Provide code snippets if asked.
Use Markdown for formatting.
`;

const EDITABLE_LAYER_INSTRUCTION = `
You are an "Image to Canvas Object Converter".
Your goal is to decompose the UI image into a flat list of editable canvas objects.

## Output Requirements:
1. **analysis**: Brief summary.
2. **code**: A JSON ARRAY string (raw JSON, no markdown blocks) containing objects with this schema:
   [
     {
       "type": "text" | "rectangle" | "image",
       "content": "string (for text)",
       "x": 0,
       "y": 0,
       "width": 100,
       "height": 100,
       "fontSize": 16,
       "backgroundColor": "#FFFFFF",
       "color": "#000000",
       "zIndex": 1
     }
   ]
   - Detect text blocks accurately.
   - Detect buttons as rectangles with text on top (2 objects).
   - Detect images as image placeholders (use type 'image').
   - Coordinates should be precise.
3. **figmaGuide**: Standard guide.
`;

export const analyzeImage = async (
  base64Image: string,
  prompt: string = "Analyze this UI and generate code.",
  settings?: GenerationSettings,
  mode: AnalysisMode = 'code'
): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    let finalPrompt = prompt;
    if (settings) {
      finalPrompt += `\n\n### Configuration:\n- Framework: ${settings.framework}\n- Device Target: ${settings.device}\n- Output Type: ${settings.type}`;

      if (settings.figmaLayout) {
        finalPrompt += `\n- **Figma Auto Layout Optimization**: ENABLED. Use strict Flexbox (display: flex) for all layouts to ensure perfect conversion to Figma Auto Layout. Avoid absolute positioning unless strictly necessary for overlays. Use consistent 'gap', 'padding', and 'margin' classes. Ensure deep and clean nesting structure.`;
      }

      if (settings.figmaVariables) {
        finalPrompt += `\n- **Figma Variables**: ENABLED. You MUST extract all used colors, font sizes, and spacing into CSS Variables defined in a \`:root\` block within a \`<style>\` tag at the very top of the code. This allows for easy variable import in Figma.`;
      }

      finalPrompt += `\n\nPlease generate the code according to these settings.`;
    }

    let selectedInstruction = SYSTEM_INSTRUCTION;
    if (mode === 'wireframe') selectedInstruction = WIREFRAME_SYSTEM_INSTRUCTION;
    else if (mode === 'design-system') selectedInstruction = DESIGN_SYSTEM_INSTRUCTION;
    else if (mode === 'style') selectedInstruction = STYLE_ANALYSIS_INSTRUCTION;
    else if (mode === 'ux-audit') selectedInstruction = UX_AUDIT_INSTRUCTION;
    else if (mode === 'editable-layer') selectedInstruction = EDITABLE_LAYER_INSTRUCTION;

    const response = await ai.models.generateContent({
      model: model,
      config: {
        systemInstruction: selectedInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            code: { type: Type.STRING },
            figmaGuide: { type: Type.STRING },
          },
          required: ["analysis", "code", "figmaGuide"],
        },
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", 
              data: cleanBase64,
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text) as AnalysisResult;
    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string, 
  attachments: { data: string }[] = []
): Promise<string> => {
  try {
    let validHistory = history.filter(msg => msg.id !== 'welcome' && !msg.isLoading);
    if (validHistory.length > 0 && validHistory[0].role !== 'user') {
      const firstUserIndex = validHistory.findIndex(m => m.role === 'user');
      if (firstUserIndex !== -1) {
        validHistory = validHistory.slice(firstUserIndex);
      } else {
        validHistory = [];
      }
    }

    const geminiHistory: Content[] = validHistory.map(msg => {
      const parts: Part[] = [{ text: msg.text || " " }];
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          const cleanData = att.data.includes('base64,') 
            ? att.data.split('base64,')[1] 
            : att.data;
          parts.push({ inlineData: { mimeType: "image/png", data: cleanData } });
        });
      }
      return { role: msg.role, parts: parts };
    });

    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 16000 }
      },
      history: geminiHistory
    });

    const parts: Part[] = [{ text: newMessage }];
    attachments.forEach(att => {
      const cleanData = att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data;
      parts.push({ inlineData: { mimeType: "image/png", data: cleanData } });
    });

    const response = await chat.sendMessage({ message: parts });
    return response.text || "I couldn't generate a response.";

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error connecting to Gemini. Please try again.";
  }
};
