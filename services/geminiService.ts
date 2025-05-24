import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_KEY_WARNING } from '../constants';
import { Priority, SocialPlatform } from "../types";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(GEMINI_API_KEY_WARNING);
}

export const isGeminiAvailable = (): boolean => !!ai;

const handleError = (error: unknown, defaultMessage: string): Error => {
  console.error("Gemini API Error:", error);
  if (error instanceof Error) {
    return new Error(`${defaultMessage} Details: ${error.message}`);
  }
  return new Error(`${defaultMessage} An unknown error occurred.`);
};

export const generateContentIdeas = async (prompt: string): Promise<string> => {
  if (!ai) throw new Error(GEMINI_API_KEY_WARNING);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    throw handleError(error, "Failed to generate content ideas.");
  }
};

export const generatePlatformSpecificContent = async (basePrompt: string, platform: SocialPlatform, topic: string, tone?: string, keywords?: string): Promise<string> => {
  if (!ai) throw new Error(GEMINI_API_KEY_WARNING);

  let platformInstructions = "";
  switch (platform) {
    case SocialPlatform.X:
      platformInstructions = "Craft a concise and engaging post for X (formerly Twitter). Use relevant hashtags. Keep it under 280 characters.";
      break;
    case SocialPlatform.LINKEDIN:
      platformInstructions = "Develop a professional post for LinkedIn. Focus on insights, industry value, or thought leadership. Encourage discussion.";
      break;
    case SocialPlatform.INSTAGRAM:
      platformInstructions = "Create a compelling caption for an Instagram post. It should be visual-friendly and encourage engagement. Include relevant hashtags and emojis.";
      break;
    default:
      platformInstructions = "Generate content suitable for a general social media platform.";
  }

  const fullPrompt = `
    Platform: ${platform}
    Topic: ${topic}
    ${tone ? `Desired Tone: ${tone}` : ""}
    ${keywords ? `Keywords to include: ${keywords}` : ""}
    User's Core Request: ${basePrompt}

    ${platformInstructions}
    Please provide the content directly.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    throw handleError(error, `Failed to generate content for ${platform}.`);
  }
};


export const suggestTaskPriority = async (title: string, description?: string, dueDate?: string): Promise<Priority> => {
  if (!ai) throw new Error(GEMINI_API_KEY_WARNING);

  const prompt = `
    Analyze the following task details and suggest a priority level (High, Medium, or Low).
    Consider urgency (due date), importance (implied by title/description), and potential impact.

    Task Title: "${title}"
    ${description ? `Description: "${description}"` : ""}
    ${dueDate ? `Due Date: "${new Date(dueDate).toLocaleDateString()}"` : "No specific due date."}

    Respond with only one word: High, Medium, or Low.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        // Ensure plain text response for simple parsing
        responseMimeType: "text/plain",
      }
    });
    const suggestedPriorityText = response.text.trim();
    
    if (Object.values(Priority).includes(suggestedPriorityText as Priority)) {
      return suggestedPriorityText as Priority;
    }
    console.warn(`Gemini returned an unexpected priority: '${suggestedPriorityText}'. Defaulting to Medium.`);
    return Priority.MEDIUM; // Default if parsing fails or unexpected response
  } catch (error) {
    throw handleError(error, "Failed to suggest task priority.");
  }
};


export const generateDetailedContent = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (!ai) throw new Error(GEMINI_API_KEY_WARNING);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
      }
    });
    return response.text;
  } catch (error) {
    throw handleError(error, "Failed to generate detailed content.");
  }
};