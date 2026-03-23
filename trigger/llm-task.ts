import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const llmTask = task({
  id: "llm-execute",
  run: async (payload: {
    model: string;
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
  }) => {
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? ""
    );

    const model = genAI.getGenerativeModel({
      model: payload.model ?? "gemini-2.0-flash",
    });

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (payload.systemPrompt) {
      parts.push({ text: `System: ${payload.systemPrompt}\n\n` });
    }

    parts.push({ text: payload.userMessage });

    for (const url of payload.imageUrls ?? []) {
      if (url?.startsWith("http")) {
        try {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mimeType =
            response.headers.get("content-type") ?? "image/jpeg";
          parts.push({ inlineData: { mimeType, data: base64 } });
        } catch {
          // Skip failed images
        }
      }
    }

    const result = await model.generateContent(parts);
    return { text: result.response.text() };
  },
});
