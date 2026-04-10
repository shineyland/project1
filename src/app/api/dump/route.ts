import { NextResponse } from "next/server";
import { processBrainDump } from "@/lib/ai/client";

export async function POST(request: Request) {
  const body = await request.json();
  const rawInput = body.rawInput?.trim();

  if (!rawInput) {
    return NextResponse.json({ error: "rawInput is required" }, { status: 400 });
  }

  if (rawInput.length > 10000) {
    return NextResponse.json(
      { error: "Input too long (max 10,000 characters)" },
      { status: 400 }
    );
  }

  try {
    const plan = await processBrainDump(rawInput);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("AI processing error:", error);
    return NextResponse.json(
      { error: "Failed to process brain dump" },
      { status: 500 }
    );
  }
}
