import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

// GET /api/requests - Retorna todas as solicitações
export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST /api/requests - Cria uma nova solicitação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const titleStr = String(title).trim();
    const descriptionStr = String(description).trim();
    const ai_summary = await generateSummary(titleStr, descriptionStr);

    const newRequest = await prisma.request.create({
      data: {
        title: titleStr,
        description: descriptionStr,
        ai_summary,
      },
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
