import { z } from "zod";

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  data: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  data: z
    .object({
      nodes: z.array(z.any()),
      edges: z.array(z.any()),
    })
    .optional(),
});

export const executeWorkflowSchema = z.object({
  nodeIds: z.array(z.string()).optional(),
  scope: z.enum(["full", "partial", "single"]),
});

export const llmTaskSchema = z.object({
  systemPrompt: z.string().optional(),
  userMessage: z.string().min(1),
  imageUrls: z.array(z.string().url()).optional(),
  model: z.string().default("gemini-3-flash-preview"),
});

export const cropImageSchema = z.object({
  imageUrl: z.string().url(),
  xPercent: z.number().min(0).max(100).default(0),
  yPercent: z.number().min(0).max(100).default(0),
  widthPercent: z.number().min(1).max(100).default(100),
  heightPercent: z.number().min(1).max(100).default(100),
});

export const extractFrameSchema = z.object({
  videoUrl: z.string().url(),
  timestamp: z.string().default("0"),
});
