// Email templates for the website. This file is used by contact.js and review.js.
// (The underscore in the name tells Vercel not to treat it as a web address.)
//
// There are four emails:
//   ownerMessage  -> to Sadaf, when someone sends a message
//   ownerReview   -> to Sadaf, when someone sends a review
//   thanksMessage -> to the visitor, to say thank you for their message   (only if SEND_CONFIRMATION=true)
//   thanksReview  -> to the visitor, to say thank you for their review    (only if SEND_CONFIRMATION=true)

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NAVY = '#0b1f3f';

function shell(inner, footer) {
  return `<!doctype html><html><body style="margin:0;background:#eef2f9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1f2d46">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:${NAVY};padding:22px 28px"><div style="font-family:Georgia,serif;font-size:22px;color:#ffffff">Sadaf Raza</div><div style="color:#9db4de;font-size:13px;margin-top:4px">Founder of GaiaVolt</div></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">${inner}</td></tr>
<tr><td style="padding:16px 28px;background:#f5f8fc;color:#6b7a90;font-size:12px;line-height:1.5">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const row = (label, value) => `<tr><td style="padding:6px 14px 6px 0;color:#6b7a90;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#0b1f3f"><b>${value}</b></td></tr>`;

// ---------- to Sadaf ----------
function ownerMessage({ name, email, message }) {
  return {
    subject: 'New message from ' + name,
    html: shell(
      `<h2 style="margin:0 0 14px;font-family:Georgia,serif;color:${NAVY}">New message from your portfolio</h2>
<table role="presentation" cellspacing="0" cellpadding="0">${row('Name', esc(name))}${row('Email', esc(email))}</table>
<div style="margin:18px 0 0;padding:16px;background:#f5f8fc;border-radius:10px;white-space:pre-wrap">${esc(message)}</div>`,
      'Just press <b>Reply</b> on this email to answer them. Your reply goes straight to ' + esc(email) + '.'
    ),
  };
}

function ownerReview({ name, country, title, review, email, linkedin, saved, snippet }) {
  const how = saved
    ? `<p style="margin:18px 0 0">It is saved in Supabase and is <b>not shown yet</b>. Check that this is a real person (you can press Reply to ask them). To show it, open <b>Supabase &gt; Table Editor &gt; reviews</b> and set <b>approved</b> to true.</p>`
    : `<p style="margin:18px 0 6px">It could not be saved in the database. If you approve it, paste this into the REVIEWS list in index.html, and add their photo file:</p><pre style="background:#f5f8fc;padding:12px;border-radius:8px;white-space:pre-wrap;font-size:12px">${esc(snippet)}</pre>`;
  return {
    subject: 'New review from ' + name,
    html: shell(
      `<h2 style="margin:0 0 14px;font-family:Georgia,serif;color:${NAVY}">New review for your portfolio</h2>
<table role="presentation" cellspacing="0" cellpadding="0">${row('Name', esc(name))}${row('Country', esc(country))}${row('Title / bio', esc(title))}${row('Email (private)', esc(email))}${row('LinkedIn', linkedin ? esc(linkedin) : 'not added')}${row('Photo', 'attached')}</table>
<div style="margin:18px 0 0;padding:16px;background:#f5f8fc;border-radius:10px;white-space:pre-wrap">${esc(review)}</div>${how}`,
      'They agreed that their name, country, title, photo, review and LinkedIn link (if added) may be shown on your site. Their email stays private.'
    ),
  };
}

// ---------- to the visitor ----------
function thanksMessage({ name, replyTo }) {
  const first = esc(String(name).split(' ')[0]);
  return {
    subject: 'Thank you for your message',
    html: shell(
      `<p style="margin:0 0 14px">Hi ${first},</p>
<p style="margin:0 0 14px">Thank you for your message. I have received it and I will reply as soon as I can.</p>
<p style="margin:0">Warm regards,<br><b>Sadaf Raza</b></p>`,
      'This is an automatic email. You can reply to it to reach me' + (replyTo ? ' at ' + esc(replyTo) : '') + '. If you did not send a message from my website, you can ignore this email.'
    ),
    text: `Hi ${String(name).split(' ')[0]},\n\nThank you for your message. I have received it and I will reply as soon as I can.\n\nWarm regards,\nSadaf Raza\n\n(This is an automatic email. If you did not send a message from my website, you can ignore it.)`,
  };
}

function thanksReview({ name, replyTo }) {
  const first = esc(String(name).split(' ')[0]);
  return {
    subject: 'Thank you for your review',
    html: shell(
      `<p style="margin:0 0 14px">Hi ${first},</p>
<p style="margin:0 0 14px">Thank you for taking the time to write a review. It means a lot to me.</p>
<p style="margin:0 0 14px">I check every review before it appears on my website, so yours will show up once I have looked at it. I may contact you if I need to confirm anything.</p>
<p style="margin:0">Warm regards,<br><b>Sadaf Raza</b></p>`,
      'This is an automatic email. You can reply to it to reach me' + (replyTo ? ' at ' + esc(replyTo) : '') + '. If you did not send a review from my website, you can ignore this email.'
    ),
    text: `Hi ${String(name).split(' ')[0]},\n\nThank you for taking the time to write a review. It means a lot to me.\n\nI check every review before it appears on my website, so yours will show up once I have looked at it. I may contact you if I need to confirm anything.\n\nWarm regards,\nSadaf Raza\n\n(This is an automatic email. If you did not send a review from my website, you can ignore it.)`,
  };
}

module.exports = { ownerMessage, ownerReview, thanksMessage, thanksReview };