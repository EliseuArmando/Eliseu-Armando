import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { VeoConfig, ProImageConfig } from "../types";

// Helper to get client with current key
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. STRATEGIST: Image + Copy -> Final Visual Creative with Text
export const generateMachiavellianCreative = async (
  imageBase64: string,
  mimeType: string,
  copy: string
): Promise<{ headline: string; strategy: string; finalImage: string }> => {
  const ai = getClient();

  // Step 1: Refine the copy into a Strategy and a Short Headline using Gemini 3 Pro
  // We need a short headline because AI models render short text better on images.
  const textPrompt = `
    You are Niccolò Machiavelli. The user has a draft copy: "${copy}".
    
    1. Create a "Strategy": A short explanation in Portuguese of why the user's copy was weak and how to make it powerful.
    2. Create a "Headline": A VERY SHORT (max 6 words), punchy, uppercase headline in Portuguese based on the copy that asserts dominance.
    
    Return JSON.
  `;

  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { text: textPrompt },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy: { type: Type.STRING },
          headline: { type: Type.STRING }
        },
        required: ["strategy", "headline"]
      }
    }
  });

  const textData = JSON.parse(textResponse.text || "{}");
  const headline = textData.headline || "O PODER É TUDO";

  // Step 2: Generate the final image with the text embedded using Gemini 2.5 Flash Image
  // We ask it to modify the image to include the text.
  const imagePrompt = `
    Transform this image into a high-end, cinematic advertisement. 
    Overlay the following text directly onto the image in a bold, prestigious, gold or metallic font: "${headline}".
    Ensure the text is legible, centered or artistically placed, and the lighting is dramatic. 
    The style should be Machiavellian, luxurious, and powerful.
  `;

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: imagePrompt },
      ],
    },
  });

  let finalImage = "";
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      finalImage = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  if (!finalImage) throw new Error("Failed to generate creative visual.");

  return {
    headline,
    strategy: textData.strategy,
    finalImage
  };
};

// 2. EDITOR: Image + Prompt -> Edited Image (Gemini 2.5 Flash Image)
export const editImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: prompt },
      ],
    },
  });

  // Check for image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  // If no image, it's likely a text refusal or error description
  if (response.text) {
    throw new Error(response.text);
  }

  throw new Error("No image generated. The model may have refused the request.");
};

// 3. PROPAGANDA: Image -> Video (Veo)
export const generateVeoVideo = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  config: VeoConfig
): Promise<string> => {
  const ai = getClient(); 
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Cinematic, dramatic movement, high production value.",
    image: {
      imageBytes: imageBase64,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio,
    }
  });

  // Polling
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed.");

  // Fetch with key
  const fetchResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await fetchResponse.blob();
  return URL.createObjectURL(blob);
};

// 4. FORGE: Text -> Image (Gemini 3 Turbo Image)
export const generateProImage = async (
  prompt: string,
  config: ProImageConfig
): Promise<string> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-turbo-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

// 5. LIVE COUNCIL
export const getLiveClient = () => getClient();