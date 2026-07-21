import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { projectId } = await req.json();
  const supabase = getSupabase();

  const { data: project } = await supabase
    .from("projects")
    .select("title, demo_url, user_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: { user } } = await supabase.auth.admin.getUserById(project.user_id);
  const toEmail = user?.email;

  if (!toEmail) {
    return NextResponse.json({ error: "No user email" }, { status: 400 });
  }

  const rawName = toEmail.split("@")[0].replace(/[._-]/g, " ").split(" ")[0];
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  const greeting = /^[a-z]/i.test(firstName) ? firstName : "there";

  const title = project.title ?? "Your Project";
  const demoUrl = project.demo_url ?? "https://worldshifttech.com";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Drew at World Shift Technologies <drew@worldshifttech.com>",
      to: toEmail,
      subject: "Your project demo is live",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F4F2EE;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F2EE;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(0,32,92,0.08);">
          <tr>
            <td style="padding:48px 40px 32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4B858E;">World Shift Technologies</p>
              <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#00205C;line-height:1.3;">"${title}" is ready to explore.</h1>
              <p style="margin:0 0 32px;font-size:16px;color:rgba(0,32,92,0.75);line-height:1.6;">Hi ${greeting},<br><br>Your project is live. Drew has reviewed and approved the build.</p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td>
                    <a href="${demoUrl}" target="_blank" style="display:inline-block;background-color:#4B858E;color:#080C14;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">View Your Demo &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 40px;font-size:14px;color:rgba(0,32,92,0.55);line-height:1.6;">This is an early build. Reply to this email with any questions or feedback.</p>
              <div style="border-top:1px solid rgba(0,32,92,0.08);padding-top:32px;">
                <p style="margin:0 0 4px;font-size:14px;color:#00205C;font-weight:600;">Drew Griffiths</p>
                <p style="margin:0 0 4px;font-size:13px;color:rgba(0,32,92,0.55);">World Shift Technologies</p>
                <a href="https://worldshifttech.com" style="font-size:13px;color:#4B858E;text-decoration:none;">worldshifttech.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
    console.log("[CLIENT EMAIL SENT]");
  } catch {
    console.error("[CLIENT EMAIL FAILED]");
  }

  return NextResponse.json({ ok: true });
}
