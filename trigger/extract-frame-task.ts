import { task } from "@trigger.dev/sdk/v3";

export const extractFrameTask = task({
  id: "extract-frame",
  run: async (payload: {
    videoUrl: string;
    timestamp: string;
  }) => {
    // In production, this would:
    // 1. Download the video from videoUrl
    // 2. Use FFmpeg to extract a frame at the given timestamp
    // 3. Upload the frame to Transloadit
    // 4. Return the frame image URL

    // For now, return a placeholder (FFmpeg integration requires
    // Trigger.dev cloud runtime with FFmpeg binary available)
    return { url: payload.videoUrl };
  },
});
