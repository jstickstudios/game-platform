export async function sendLoginCode(
  email: string,
  code: string,
  username: string,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "JStick Studios <onboarding@resend.dev>",
        to: [email],
        subject: "Your JStick Studios login code",
        text: `Hi ${username}! Your login code is ${code}. It expires in 10 minutes. If you didn't try to log in, you can ignore this email.`,
        html: `<div style="font-family:system-ui,'Segoe UI',Roboto,sans-serif;background:#0b0f19;color:#e5e7eb;padding:32px;border-radius:16px;max-width:480px;margin:0 auto">
  <h1 style="color:#22d3ee;margin:0 0 12px;font-size:22px">🎮 JStick Studios</h1>
  <p style="margin:0 0 20px">Hi <b>${username}</b>, here is your login code:</p>
  <p style="font-size:34px;font-weight:900;letter-spacing:12px;text-align:center;background:#111827;border:1px solid #22d3ee;border-radius:12px;padding:16px;margin:0 0 20px;color:#22d3ee">${code}</p>
  <p style="margin:0 0 8px">This code expires in <b>10 minutes</b>.</p>
  <p style="margin:0;opacity:.7;font-size:13px">If you didn't try to log in, you can safely ignore this email.</p>
</div>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
