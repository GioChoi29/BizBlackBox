import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || "BBB Portal <onboarding@resend.dev>";
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

let client = null;
function getClient() {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

// Send credentials email. Returns { sent: boolean, error?: string }.
// Best-effort — failure never throws; callers continue regardless.
export async function sendCredentialsEmail({ to, name, username, tempPassword, isReset }) {
  if (!to) return { sent: false, error: "no email address" };
  const r = getClient();
  if (!r) return { sent: false, error: "RESEND_API_KEY not configured" };

  const subject = isReset
    ? "Your BBB 2026 Portal password has been reset"
    : "Your BBB 2026 Portal access";

  const intro = isReset
    ? "Your portal password was reset by an admin. Use this temporary password to sign in — you'll be prompted to set a new one."
    : "You've been added to the BBB 2026 portal. Use these credentials to sign in for the first time — you'll be prompted to set your own password.";

  const loginUrl = `${baseUrl}/login`;

  const text = `Hi ${name || username},

${intro}

Username: ${username}
Temporary password: ${tempPassword}

Sign in here: ${loginUrl}

— BBB 2026 Team`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;color:#14161d;line-height:1.5">
    <p>Hi ${escapeHtml(name || username)},</p>
    <p>${escapeHtml(intro)}</p>
    <div style="background:#fafafb;border:1px solid #ececef;border-radius:12px;padding:18px 22px;margin:18px 0">
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:13px;color:#5c6273;margin-bottom:6px">Username</div>
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:16px;font-weight:700;margin-bottom:14px">${escapeHtml(username)}</div>
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:13px;color:#5c6273;margin-bottom:6px">Temporary password</div>
      <div style="font-family:'JetBrains Mono',Menlo,monospace;font-size:16px;font-weight:700">${escapeHtml(tempPassword)}</div>
    </div>
    <p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:11px 22px;border-radius:10px;background:#6c5ce7;color:#fff;text-decoration:none;font-weight:600">Sign in to the portal</a></p>
    <p style="color:#9298B2;font-size:12px;margin-top:30px">— BBB 2026 Team</p>
  </div>`;

  try {
    const { data, error } = await r.emails.send({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    if (error) return { sent: false, error: error.message || String(error) };
    return { sent: true, id: data?.id };
  } catch (e) {
    return { sent: false, error: e.message || String(e) };
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
