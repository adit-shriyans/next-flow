import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflowId } = await params;

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });
  if (!workflow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const runs = await prisma.workflowRun.findMany({
    where: { workflowId },
    orderBy: { startedAt: "desc" },
    include: {
      nodeRuns: {
        orderBy: { startedAt: "asc" },
      },
    },
    take: 50,
  });

  return NextResponse.json(runs);
}
