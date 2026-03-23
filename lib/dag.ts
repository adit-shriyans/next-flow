import type { Edge } from "@xyflow/react";

export function topologicalSort(
  nodeIds: string[],
  edges: Edge[]
): string[] | null {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const nodeSet = new Set(nodeIds);

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const edge of edges) {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) continue;
    adjacency.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodeIds.length) return null; // cycle detected
  return sorted;
}

export function getExecutionLevels(
  nodeIds: string[],
  edges: Edge[]
): string[][] | null {
  const sorted = topologicalSort(nodeIds, edges);
  if (!sorted) return null;

  const nodeSet = new Set(nodeIds);
  const level = new Map<string, number>();

  for (const id of sorted) {
    let maxParentLevel = -1;
    for (const edge of edges) {
      if (edge.target === id && nodeSet.has(edge.source)) {
        maxParentLevel = Math.max(
          maxParentLevel,
          level.get(edge.source) ?? 0
        );
      }
    }
    level.set(id, maxParentLevel + 1);
  }

  const maxLevel = Math.max(...Array.from(level.values()), 0);
  const levels: string[][] = [];
  for (let i = 0; i <= maxLevel; i++) {
    levels.push(
      sorted.filter((id) => level.get(id) === i)
    );
  }

  return levels;
}

export function getUpstreamNodes(
  nodeId: string,
  edges: Edge[]
): Set<string> {
  const upstream = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.target === current && !upstream.has(edge.source)) {
        upstream.add(edge.source);
        queue.push(edge.source);
      }
    }
  }
  return upstream;
}
