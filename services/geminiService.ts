
import { GoogleGenAI, Modality } from "@google/genai";
import { stripBase64Prefix } from '../utils/image';
import type { MimeType } from '../utils/image';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const editImageWithPrompt = async (
  base64Image: string,
  mimeType: MimeType,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: stripBase64Prefix(base64Image),
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      const newBase64Data = firstPart.inlineData.data;
      const newMimeType = firstPart.inlineData.mimeType;
      return `data:${newMimeType};base64,${newBase64Data}`;
    } else {
      throw new Error('No image was generated. The model may have refused the request.');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate image with Gemini API. Please check your prompt or try again later.');
  }
};
