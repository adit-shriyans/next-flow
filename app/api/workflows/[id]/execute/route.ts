import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? ""
);

// POST: Create a new workflow run
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const workflow = await prisma.workflow.findFirst({
    where: { id, userId },
  });
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const scopeMap: Record<string, "FULL" | "PARTIAL" | "SINGLE"> = {
    full: "FULL",
    partial: "PARTIAL",
    single: "SINGLE",
  };

  const run = await prisma.workflowRun.create({
    data: {
      workflowId: id,
      scope: scopeMap[body.scope] ?? "FULL",
      status: "RUNNING",
    },
  });

  return NextResponse.json({ id: run.id });
}

// PUT: Execute a single node
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { runId, nodeId, nodeType, data } = body;

  const startTime = Date.now();
  let output: unknown = null;
  let error: string | undefined;

  try {
    switch (nodeType) {
      case "textNode":
        output = data.text ?? "";
        break;

      case "uploadImageNode":
        output = data.imageBase64 ?? data.imageUrl ?? data.output ?? "";
        break;

      case "uploadVideoNode":
        output = data.videoUrl ?? data.output ?? "";
        break;

      case "llmNode":
        output = await executeLLM(data);
        break;

      case "cropImageNode":
        output = await executeCropImage(data);
        break;

      case "extractFrameNode":
        output = await executeExtractFrame(data);
        break;

      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  } catch (err) {
    console.error(`[Execute] Node ${nodeId} (${nodeType}) failed:`, err instanceof Error ? err.message : err);
    error = err instanceof Error ? err.message : "Execution failed";
  }

  const duration = Date.now() - startTime;

  if (runId) {
    try {
      await prisma.nodeRun.create({
        data: {
          workflowRunId: runId,
          nodeId,
          nodeType,
          status: error ? "FAILED" : "SUCCESS",
          inputs: data as object,
          output: output ? (typeof output === "string" ? { value: output } : (output as object)) : undefined,
          error,
          duration,
        },
      });
    } catch {
      // Non-critical
    }
  }

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ output, duration });
}

// PATCH: Finalize a workflow run
export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { runId, status, duration } = body;

  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  const statusMap: Record<string, "SUCCESS" | "FAILED" | "PARTIAL"> = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PARTIAL: "PARTIAL",
  };

  await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: statusMap[status] ?? "FAILED",
      duration,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

async function executeLLM(data: Record<string, unknown>): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: (data.model as string) ?? "gemini-3-flash-preview",
  });

  const systemPrompt = (data.system_prompt as string) || (data.systemPrompt as string) || "";
  const userMessage = (data.user_message as string) || (data.userMessage as string) || "";
  const imageUrls = ((data.images as string[]) ?? (data.imageUrls as string[]) ?? []).filter(Boolean);

  if (!userMessage) {
    throw new Error("User message is required");
  }

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (systemPrompt) {
    parts.push({ text: `System: ${systemPrompt}\n\n` });
  }

  parts.push({ text: userMessage });

  for (const url of imageUrls) {
    if (!url) continue;

    if (url.startsWith("data:")) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    } else if (url.startsWith("http")) {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = response.headers.get("content-type") ?? "image/jpeg";
        parts.push({
          inlineData: { mimeType, data: base64 },
        });
      } catch {
        // Skip images that fail to fetch
      }
    }
  }

  const result = await model.generateContent(parts);
  return result.response.text();
}

async function executeCropImage(
  data: Record<string, unknown>
): Promise<string> {
  const imageUrl = (data.image_url as string) || (data.imageUrl as string) || "";
  if (!imageUrl) throw new Error("Image URL is required");

  // In a full implementation, this would use Trigger.dev + FFmpeg
  // For now, return the original image URL with crop params noted
  return imageUrl;
}

async function executeExtractFrame(
  data: Record<string, unknown>
): Promise<string> {
  const videoUrl = (data.video_url as string) || (data.videoUrl as string) || "";
  if (!videoUrl) throw new Error("Video URL is required");

  // In a full implementation, this would use Trigger.dev + FFmpeg
  // For now, return a placeholder
  return videoUrl;
}
