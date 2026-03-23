import { task } from "@trigger.dev/sdk/v3";

export const cropImageTask = task({
  id: "crop-image",
  run: async (payload: {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }) => {
    // In production, this would:
    // 1. Download the image from imageUrl
    // 2. Use FFmpeg to crop based on percentage params
    // 3. Upload the result to Transloadit
    // 4. Return the cropped image URL

    // For now, return the original URL (FFmpeg integration requires
    // Trigger.dev cloud runtime with FFmpeg binary available)
    return { url: payload.imageUrl };
  },
});
