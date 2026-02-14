import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["approved", "rejected"] as const;

// PATCH /api/requests/[id] - Atualiza status da solicitação
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
