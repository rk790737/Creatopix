import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import type { GeneratorFormState, UploadedFile, Captions } from '../types';
import * as C from '../constants';

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeImageType = async (imageFile: UploadedFile): Promise<'Model Photography' | 'Product Photography'> => {
    const ai = getAI();
    const prompt = "Analyze this image. Is it primarily 'product photography' (focused on an object without a person) or 'model photography' (featuring a person prominently)? Respond with only the string 'Product Photography' or 'Model Photography'.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: imageFile.base64, mimeType: imageFile.type } },
                    { text: prompt }
                ]
            },
        });

        const result = response.text?.trim();
        if (result === 'Product Photography' || result === 'Model Photography') {
            return result;
        }
        
        console.warn("Image analysis returned unexpected result:", result);
        return 'Model Photography'; // Default if analysis is unclear
    } catch (error) {
        console.error("Error during image analysis:", error);
        // In case of an API error, default to a safe value.
        throw new Error("Failed to analyze image. The API may be unavailable.");
    }
};

const buildImagePrompt = (state: GeneratorFormState, modelPhotoProvided: boolean): string => {
  const details = [];

  if (modelPhotoProvided) {
      details.push("NON-NEGOTIABLE CORE DIRECTIVE: The absolute priority is to replicate the model's face from the reference image with 100% accuracy. There must be zero deviation, not even 0.01%. You must preserve the exact facial features, including bone structure, eye shape and color, nose, lips, chin, and unique facial markers. The generated face must be indistinguishable from the person in the provided photo. All other stylistic instructions (lighting, clothing, pose, environment) are secondary and must be applied *around* this perfectly preserved face. Do not interpret, enhance, or alter the model's facial identity in any way. The final image's success is judged solely on the perfect replication of the model's face.");
  }

  // Core description is most important.
  if (state.description) {
      details.push(state.description);
  }

  // Add aspect ratio to the prompt for multimodal models
  if (state.aspectRatio && state.aspectRatio !== C.ASPECT_RATIOS[0]) {
    details.push(`aspect ratio: ${state.aspectRatio}`);
  }

  if (state.platformTarget !== 'Auto' && state.platformTarget !== 'None') details.push(`for ${state.platformTarget}`);
  if (state.realismLevel !== 'Auto' && state.realismLevel !== 'None') details.push(`style: ${state.realismLevel}`);
  
  if (state.photographyType === 'Model Photography') {
    let modelParts = [];
    if (state.modelType !== 'Auto' && state.modelType !== 'None') modelParts.push(state.modelType);
    if (state.ageGeneration !== 'Auto' && state.ageGeneration !== 'None') modelParts.push(state.ageGeneration);
    if(modelParts.length > 0) details.push(`model: ${modelParts.join(', ')}`);
    
    if (state.pose !== 'Auto' && state.pose !== 'None') details.push(`pose: ${state.pose}`);
    if (state.modelExpression !== 'Auto' && state.modelExpression !== 'None') details.push(`expression: ${state.modelExpression}`);
    if (state.hairDetail !== 'Auto' && state.hairDetail !== 'None') details.push(`hair: ${state.hairDetail} texture`);
    
    let skinDetails = [];
    if (state.skinDetail !== 'Auto' && state.skinDetail !== 'None') {
        skinDetails.push(state.skinDetail);
    }
    skinDetails.push("ultra-realistic skin with natural texture");
    skinDetails.push("subtle pores, fine details, peach fuzz, and even goosebumps should be visible upon close inspection, depending on the context");
    skinDetails.push("natural, healthy skin sheen, not oily or plastic");
    skinDetails.push("avoiding an airbrushed or overly smooth look");
    details.push(`skin: ${skinDetails.join(', ')}`);

  } else {
    details.push(`product-only shot, no models`);
  }

  if (state.cameraAngle !== 'Auto' && state.cameraAngle !== 'None') details.push(`angle: ${state.cameraAngle}`);
  
  if (state.shootingDevice === 'Professional Camera') {
      let camStr = 'Shot on professional camera';
      let camDetails = [];
      if (state.cameraModel !== 'Auto' && state.cameraModel !== 'None') camDetails.push(`model: ${state.cameraModel}`);
      if (state.cameraLens !== 'Auto' && state.cameraLens !== 'None') camDetails.push(`lens: ${state.cameraLens}`);
      if (camDetails.length > 0) camStr += ` (${camDetails.join(', ')})`;
      details.push(camStr);
      details.push('emulate DSLR quality: natural bokeh, sharp focus, wide dynamic range');
  } else if (state.shootingDevice === 'Smartphone') {
      let phoneStr = 'Shot on smartphone';
      if (state.phoneModel !== 'Auto' && state.phoneModel !== 'None') phoneStr += ` (model: ${state.phoneModel})`;
      details.push(phoneStr);
      details.push('emulate smartphone computational photography: vibrant colors, HDR, edge sharpness');
  }

  if (state.presentationType !== 'Auto' && state.presentationType !== 'None') details.push(`presentation: ${state.presentationType}`);
  if (state.environmentType !== 'Auto' && state.environmentType !== 'None') details.push(`environment: ${state.environmentType}`);
  if (state.lightingType !== 'Auto' && state.lightingType !== 'None') details.push(`lighting: ${state.lightingType}`);
  if (state.timeOfDay && state.timeOfDay !== "Auto" && state.timeOfDay !== "None") details.push(`time of day: ${state.timeOfDay}`);
  if (state.colorGrading && state.colorGrading !== "Auto" && state.colorGrading !== "None") details.push(`color grade: ${state.colorGrading}`);
  if (state.moodType !== 'Auto' && state.moodType !== 'None') details.push(`mood: ${state.moodType}`);
  if (state.aestheticStyle && state.aestheticStyle !== "Auto" && state.aestheticStyle !== "None") details.push(`aesthetic style: ${state.aestheticStyle}`);
  if (state.photographicEffect && state.photographicEffect !== "Auto" && state.photographicEffect !== "None") details.push(`effect: ${state.photographicEffect}`);
  if (state.vibe) details.push(`vibe: ${state.vibe}`);
  
  const finalPrompt = "Create a single, ultra-realistic, photograph-style image based on these specifications: " + details.join(', ') + ". The image must be hyperrealistic, clean, 8k resolution, and indistinguishable from a real, award-winning photograph, perfectly matching all specifications. Critically, it must avoid all common AI-generated tells: no plastic skin, no blurry or over-smoothed skin, no airbrushed textures, no uncanny valley effects, no distorted hands or fingers, no strange artifacts, no inconsistent shadows. The final image should have sharp focus and macro details where appropriate. Do not include any text, letters, numbers, logos, or watermarks.";

  return finalPrompt.replace(/\s+/g, ' ').trim();
};


export const generateImages = async (state: GeneratorFormState, contextFiles: UploadedFile[], modelPhoto: UploadedFile | null): Promise<{ imageUrls: string[], prompt: string }> => {
  const ai = getAI();
  const prompt = buildImagePrompt(state, !!modelPhoto);

  const parts: any[] = [];
  if (modelPhoto) {
      parts.push({
          inlineData: {
              data: modelPhoto.base64,
              mimeType: modelPhoto.type,
          },
      });
  }

  contextFiles.forEach(file => parts.push({
    inlineData: {
      data: file.base64,
      mimeType: file.type,
    },
  }));
  parts.push({ text: prompt });

  const responses = await Promise.all([
      ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: { responseModalities: [Modality.IMAGE] },
      }),
      ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: { responseModalities: [Modality.IMAGE] },
      }),
      ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: { responseModalities: [Modality.IMAGE] },
      }),
  ]);
  
  const imageUrls: string[] = [];
  for (const response of responses) {
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
          for (const part of parts) {
              if (part.inlineData) {
                  imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
              }
          }
      }
  }
  if (imageUrls.length === 0) {
      throw new Error("Image generation failed. The model may have blocked the response or returned no images.");
  }
  return { imageUrls, prompt };
};

export const generateBlankProductMockup = async (imageFile: UploadedFile): Promise<string> => {
    const ai = getAI();
    const prompt = `Analyze the provided product image. Create a photorealistic mockup of *only the product itself*, completely removing any existing text, labels, brand names, or logos from its surface. The product should be presented cleanly on a neutral, professional studio background (light gray or white). The final image should be a clean, unbranded product ready for new designs. Do not add any new elements. Focus solely on isolating the product and cleaning its surface.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageFile.base64, mimeType: imageFile.type } },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("Mockup generation failed: No image data returned from the model.");

    } catch (error) {
        console.error("Error generating blank product mockup:", error);
        throw new Error("Failed to generate the product mockup.");
    }
};

export const generateCaptions = async (prompt: string, mood: string): Promise<Captions> => {
  const ai = getAI();
  const captionPrompt = `Based on the following image prompt: "${prompt}", and the mood "${mood}", generate 3 social media captions (English, Hindi, Hinglish) and relevant hashtags for each. If the mood is 'Seductive & Alluring', also add a 'Seductive' caption. The response must be a valid JSON object with the format: { "hinglish": { "caption": "...", "hashtags": ["...", "..."] }, "hindi": { "caption": "...", "hashtags": ["...", "..."] }, "english": { "caption": "...", "hashtags": ["...", "..."] }, "seductive": { "caption": "...", "hashtags": ["...", "..."] } } (seductive is optional).`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: captionPrompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  hinglish: {
                      type: Type.OBJECT,
                      required: ['caption', 'hashtags'],
                      properties: {
                          caption: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                  },
                  hindi: {
                      type: Type.OBJECT,
                      required: ['caption', 'hashtags'],
                      properties: {
                          caption: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                  },
                  english: {
                      type: Type.OBJECT,
                      required: ['caption', 'hashtags'],
                      properties: {
                          caption: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                  },
                  seductive: {
                      type: Type.OBJECT,
                      properties: {
                          caption: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      nullable: true
                  },
              },
          },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Captions;
  } catch (error) {
    console.error("Error generating captions:", error);
    throw new Error("Failed to generate captions. The API may have returned an invalid format.");
  }
};

export const generateDesignAsset = async (prompt: string, contextFile: UploadedFile | null): Promise<string> => {
    const ai = getAI();

    const parts: any[] = [{ text: prompt }];
    if (contextFile) {
        parts.unshift({
            inlineData: {
                data: contextFile.base64,
                mimeType: contextFile.type,
            },
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const responseParts = response.candidates?.[0]?.content?.parts;
        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("Asset generation failed: No image data returned.");

    } catch (error) {
        console.error("Error generating design asset:", error);
        throw new Error("Failed to generate the design asset.");
    }
};

export const generateMockup = async (imageFile: UploadedFile, aspectRatio: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Create a photorealistic 3D render of the object in this image, placing it in a professional studio setting. Aspect ratio: ${aspectRatio}.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageFile.base64, mimeType: imageFile.type } },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("3D Render generation failed: No image data returned.");

    } catch (error) {
        console.error("Error generating 3D render:", error);
        throw new Error("Failed to generate the 3D render.");
    }
};

export const generateMixedImage = async (files: UploadedFile[], prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getAI();
    
    const parts: any[] = files.map(file => ({
        inlineData: { data: file.base64, mimeType: file.type }
    }));
    parts.push({ text: `${prompt}. Aspect ratio: ${aspectRatio}.` });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const responseParts = response.candidates?.[0]?.content?.parts;
        if (responseParts) {
            for (const part of responseParts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("Image mixing failed: No image data returned.");

    } catch (error) {
        console.error("Error mixing images:", error);
        throw new Error("Failed to mix images.");
    }
};