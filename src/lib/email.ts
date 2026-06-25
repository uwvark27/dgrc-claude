import { Resend } from "resend";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderEmailHtml(bodyText: string, unsubscribeUrl: string) {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #0a0a0a;">
      ${paragraphs}
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #000;" />
      <p style="font-size: 12px; color: #666;">
        Dancing Gnome Running Club —
        <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
      </p>
    </div>
  `;
}
