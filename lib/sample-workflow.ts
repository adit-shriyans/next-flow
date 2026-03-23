import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData } from "./types";

export function getSampleWorkflow(): {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<WorkflowNodeData>[] = [
    // Branch A: Image Processing + Product Description
    {
      id: "upload-image-1",
      type: "uploadImageNode",
      position: { x: 50, y: 100 },
      data: { label: "Upload Image", status: "idle" },
    },
    {
      id: "crop-image-1",
      type: "cropImageNode",
      position: { x: 350, y: 80 },
      data: {
        label: "Crop Image",
        status: "idle",
        imageUrl: "",
        xPercent: 10,
        yPercent: 10,
        widthPercent: 80,
        heightPercent: 80,
      },
    },
    {
      id: "text-system-1",
      type: "textNode",
      position: { x: 350, y: 320 },
      data: {
        label: "System Prompt",
        status: "idle",
        text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.",
      },
    },
    {
      id: "text-details-1",
      type: "textNode",
      position: { x: 350, y: 480 },
      data: {
        label: "Product Details",
        status: "idle",
        text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
      },
    },
    {
      id: "llm-1",
      type: "llmNode",
      position: { x: 700, y: 200 },
      data: {
        label: "LLM #1 - Description",
        status: "idle",
        model: "gemini-3-flash-preview",
        systemPrompt: "",
        userMessage: "",
        imageUrls: [],
      },
    },

    // Branch B: Video Frame Extraction
    {
      id: "upload-video-1",
      type: "uploadVideoNode",
      position: { x: 50, y: 600 },
      data: { label: "Upload Video", status: "idle" },
    },
    {
      id: "extract-frame-1",
      type: "extractFrameNode",
      position: { x: 350, y: 620 },
      data: {
        label: "Extract Frame",
        status: "idle",
        videoUrl: "",
        timestamp: "50%",
      },
    },

    // Convergence: Final Marketing Summary
    {
      id: "text-system-2",
      type: "textNode",
      position: { x: 700, y: 500 },
      data: {
        label: "Summary Prompt",
        status: "idle",
        text: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.",
      },
    },
    {
      id: "llm-2",
      type: "llmNode",
      position: { x: 1050, y: 350 },
      data: {
        label: "LLM #2 - Marketing Post",
        status: "idle",
        model: "gemini-3-flash-preview",
        systemPrompt: "",
        userMessage: "",
        imageUrls: [],
      },
    },
  ];

  const edges: Edge[] = [
    // Branch A connections
    {
      id: "e-upload-crop",
      source: "upload-image-1",
      target: "crop-image-1",
      targetHandle: "image_url",
      animated: true,
    },
    {
      id: "e-system-llm1",
      source: "text-system-1",
      target: "llm-1",
      targetHandle: "system_prompt",
      animated: true,
    },
    {
      id: "e-details-llm1",
      source: "text-details-1",
      target: "llm-1",
      targetHandle: "user_message",
      animated: true,
    },
    {
      id: "e-crop-llm1",
      source: "crop-image-1",
      target: "llm-1",
      targetHandle: "images",
      animated: true,
    },

    // Branch B connections
    {
      id: "e-video-extract",
      source: "upload-video-1",
      target: "extract-frame-1",
      targetHandle: "video_url",
      animated: true,
    },

    // Convergence connections
    {
      id: "e-system2-llm2",
      source: "text-system-2",
      target: "llm-2",
      targetHandle: "system_prompt",
      animated: true,
    },
    {
      id: "e-llm1-llm2",
      source: "llm-1",
      target: "llm-2",
      targetHandle: "user_message",
      animated: true,
    },
    {
      id: "e-crop-llm2",
      source: "crop-image-1",
      target: "llm-2",
      targetHandle: "images",
      animated: true,
    },
    {
      id: "e-frame-llm2",
      source: "extract-frame-1",
      target: "llm-2",
      targetHandle: "images",
      animated: true,
    },
  ];

  return { nodes, edges };
}
