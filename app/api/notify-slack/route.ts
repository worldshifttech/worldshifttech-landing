import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectTitle, userEmail, type } = body;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({}, { status: 200 });

  let text: string;
  if (type === "audit") {
    const {
      business_name,
      business_type,
      team_size,
      monthly_spend_range,
      tools,
      waste_score,
      estimated_monthly_waste_low,
      estimated_monthly_waste_high,
    } = body;
    const toolList = Array.isArray(tools) ? tools.join(", ") : "";
    text = `🔍 New Audit: *${business_name}* — ${business_type}, ${team_size}\nStack: ${toolList}\nSpend: ${monthly_spend_range}/month | Waste score: ${waste_score}\nEst. waste: $${estimated_monthly_waste_low}–$${estimated_monthly_waste_high}/month\nhttps://worldshifttech.com/admin`;
  } else {
    text =
      type === "resubmission"
        ? `🔄 Resubmission: *${projectTitle}* — ${userEmail} — https://worldshifttech.com/admin`
        : `New project submitted: *${projectTitle}*\nFrom: ${userEmail}\nReview it at https://worldshifttech.com/admin`;
  }

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
