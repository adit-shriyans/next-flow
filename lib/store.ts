"use client";

import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from "@xyflow/react";
import type { WorkflowNodeData, NodeType, HandleType } from "./types";

interface HistorySnapshot {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

interface WorkflowStore {
  workflowId: string | null;
  workflowName: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeIds: string[];
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // Undo/Redo
  history: HistorySnapshot[];
  historyIndex: number;

  // Execution
  executingNodeIds: Set<string>;

  // Actions
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteSelectedNodes: () => void;
  setSelectedNodeIds: (ids: string[]) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  // Undo/Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Execution
  setNodeStatus: (nodeId: string, status: "idle" | "running" | "success" | "error", error?: string) => void;
  setNodeOutput: (nodeId: string, output: unknown) => void;
  addExecutingNode: (nodeId: string) => void;
  removeExecutingNode: (nodeId: string) => void;

  // Persistence
  loadWorkflow: (id: string, name: string, nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
  getWorkflowData: () => { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };

  // Connection validation
  isValidConnection: (connection: Edge | Connection) => boolean;
}

const OUTPUT_TYPES: Record<string, HandleType> = {
  textNode: "text",
  uploadImageNode: "image",
  uploadVideoNode: "video",
  llmNode: "text",
  cropImageNode: "image",
  extractFrameNode: "image",
};

const INPUT_HANDLE_TYPES: Record<string, HandleType> = {
  system_prompt: "text",
  user_message: "text",
  images: "image",
  image_url: "image",
  video_url: "video",
  timestamp: "text",
  x_percent: "text",
  y_percent: "text",
  width_percent: "text",
  height_percent: "text",
};

function getDefaultNodeData(type: NodeType): WorkflowNodeData {
  const base = { label: "", status: "idle" as const };
  switch (type) {
    case "textNode":
      return { ...base, label: "Text", text: "" };
    case "uploadImageNode":
      return { ...base, label: "Upload Image" };
    case "uploadVideoNode":
      return { ...base, label: "Upload Video" };
    case "llmNode":
      return {
        ...base,
        label: "Run LLM",
        model: "gemini-3-flash-preview",
        systemPrompt: "",
        userMessage: "",
        imageUrls: [],
      };
    case "cropImageNode":
      return {
        ...base,
        label: "Crop Image",
        imageUrl: "",
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 100,
      };
    case "extractFrameNode":
      return { ...base, label: "Extract Frame", videoUrl: "", timestamp: "0" };
  }
}

let nodeIdCounter = 0;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: null,
  workflowName: "Untitled Workflow",
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  history: [],
  historyIndex: -1,
  executingNodeIds: new Set(),

  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    if (!get().isValidConnection(connection)) return;
    get().pushHistory();
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
  },

  addNode: (type, position) => {
    get().pushHistory();
    const id = `${type}-${++nodeIdCounter}`;
    const newNode: Node<WorkflowNodeData> = {
      id,
      type,
      position,
      data: getDefaultNodeData(type),
      selected: false,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  deleteSelectedNodes: () => {
    const { nodes, edges, selectedNodeIds } = get();
    if (selectedNodeIds.length === 0) return;
    get().pushHistory();
    const idsSet = new Set(selectedNodeIds);
    set({
      nodes: nodes.filter((n) => !idsSet.has(n.id)),
      edges: edges.filter(
        (e) => !idsSet.has(e.source) && !idsSet.has(e.target)
      ),
      selectedNodeIds: [],
    });
  },

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),

  toggleLeftSidebar: () =>
    set({ leftSidebarOpen: !get().leftSidebarOpen }),

  toggleRightSidebar: () =>
    set({ rightSidebarOpen: !get().rightSidebarOpen }),

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    const snapshot = history[historyIndex];
    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const snapshot = history[historyIndex + 1];
    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      historyIndex: historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setNodeStatus: (nodeId, status, error) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, status, error: status === "error" ? error : undefined } }
          : n
      ),
    });
  },

  setNodeOutput: (nodeId, output) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, output } } : n
      ),
    });
  },

  addExecutingNode: (nodeId) => {
    const newSet = new Set(get().executingNodeIds);
    newSet.add(nodeId);
    set({ executingNodeIds: newSet });
  },

  removeExecutingNode: (nodeId) => {
    const newSet = new Set(get().executingNodeIds);
    newSet.delete(nodeId);
    set({ executingNodeIds: newSet });
  },

  loadWorkflow: (id, name, nodes, edges) => {
    set({
      workflowId: id,
      workflowName: name,
      nodes,
      edges,
      history: [],
      historyIndex: -1,
    });
  },

  getWorkflowData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  isValidConnection: (connection) => {
    const { nodes, edges } = get();
    const source = connection.source;
    const target = connection.target;
    const targetHandle = connection.targetHandle ?? null;

    if (!source || !target) return false;

    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) return false;
    if (source === target) return false;

    const sourceType = OUTPUT_TYPES[sourceNode.type ?? ""] ?? "text";
    const targetHandleType =
      INPUT_HANDLE_TYPES[targetHandle ?? ""] ?? "text";

    if (sourceType === "image" && targetHandleType === "text") return false;
    if (sourceType === "video" && targetHandleType === "text") return false;
    if (sourceType === "text" && targetHandleType === "image") return false;
    if (sourceType === "text" && targetHandleType === "video") return false;
    if (sourceType === "image" && targetHandleType === "video") return false;
    if (sourceType === "video" && targetHandleType === "image") return false;

    const existingConnection = edges.find(
      (e) =>
        e.target === target &&
        e.targetHandle === targetHandle &&
        targetHandle !== "images"
    );
    if (existingConnection) return false;

    const wouldCreateCycle = (src: string, tgt: string): boolean => {
      if (src === tgt) return true;
      const outgoing = edges
        .filter((e) => e.source === tgt)
        .map((e) => e.target);
      return outgoing.some((next) => wouldCreateCycle(src, next));
    };

    return !wouldCreateCycle(source, target);
  },
}));
