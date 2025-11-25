import { useState } from 'react';
import { ChatMessage, Layer } from '../types';
import { processGeminiRequest, GeminiRequestOptions } from '../services/geminiService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    senderId: "ai",
    text: "Welcome to Mod-Weave Core. The 'Cyber Orb' scene is loaded. Try selecting a layer and asking me to change it, like 'make the orb's glow more intense' or 'add a glitch effect to the orb'.",
    timestamp: Date.now(),
  },
];

export const useChat = (layers: Layer[], selectedLayerId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const sendMessage = async (text: string, options: Omit<GeminiRequestOptions, 'selectedLayer'>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: "user",
        text,
        timestamp: Date.now(),
        attachment: options.uploadedImage
          ? {
              type: "image",
              url: `data:image/png;base64,${options.uploadedImage}`,
            }
          : undefined,
      },
    ]);
    setIsThinking(true);

    const selectedLayer = selectedLayerId ? layers.find((l) => l.id === selectedLayerId) : null;
    const response = await processGeminiRequest(text, layers, { ...options, selectedLayer });

    setIsThinking(false);

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        senderId: "ai",
        text: response.text,
        timestamp: Date.now(),
        attachment: response.generatedImage
          ? {
              type: "image",
              url: `data:image/png;base64,${response.generatedImage}`,
            }
          : undefined,
      },
    ]);

    // Return the response so App.tsx can handle layer updates
    return response;
  };

  return {
    messages,
    isThinking,
    uploadedImage,
    setUploadedImage,
    sendMessage,
  };
};
