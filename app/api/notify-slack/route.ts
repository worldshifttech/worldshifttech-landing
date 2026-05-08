import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectTitle, userEmail, type } = await req.json();
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({}, { status: 200 });

  const text =
    type === "resubmission"
      ? `🔄 Resubmission: *${projectTitle}* — ${userEmail} — https://worldshifttech.com/admin`
      : `New project submitted: *${projectTitle}*\nFrom: ${userEmail}\nReview it at https://worldshifttech.com/admin`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return NextResponse.json({}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
