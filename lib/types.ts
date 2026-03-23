import type { Node, Edge } from "@xyflow/react";

export type HandleType = "text" | "image" | "video";

export interface HandleConfig {
  id: string;
  label: string;
  type: HandleType;
  required?: boolean;
}

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  status?: "idle" | "running" | "success" | "error";
  error?: string;
  output?: unknown;
}

export interface TextNodeData extends BaseNodeData {
  text: string;
}

export interface UploadImageNodeData extends BaseNodeData {
  imageUrl?: string;
  imageBase64?: string;
  fileName?: string;
}

export interface UploadVideoNodeData extends BaseNodeData {
  videoUrl?: string;
  fileName?: string;
}

export interface LLMNodeData extends BaseNodeData {
  model: string;
  systemPrompt: string;
  userMessage: string;
  imageUrls: string[];
  result?: string;
}

export interface CropImageNodeData extends BaseNodeData {
  imageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  croppedUrl?: string;
}

export interface ExtractFrameNodeData extends BaseNodeData {
  videoUrl: string;
  timestamp: string;
  frameUrl?: string;
}

export type WorkflowNodeData =
  | TextNodeData
  | UploadImageNodeData
  | UploadVideoNodeData
  | LLMNodeData
  | CropImageNodeData
  | ExtractFrameNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export type NodeType =
  | "textNode"
  | "uploadImageNode"
  | "uploadVideoNode"
  | "llmNode"
  | "cropImageNode"
  | "extractFrameNode";

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionRequest {
  workflowId: string;
  nodeIds?: string[];
  scope: "full" | "partial" | "single";
}

export interface NodeExecutionResult {
  nodeId: string;
  status: "success" | "error";
  output?: unknown;
  error?: string;
  duration: number;
}
