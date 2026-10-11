// Vercel serverless function: emails Sadaf when someone sends a message from the contact form.
// Environment variables (Vercel > Settings > Environment Variables):
//   RESEND_API_KEY  required
//   REVIEW_TO       where messages go (default: sadafmashorihyd@gmail.com)
//   REVIEW_FROM     sender (default: "Portfolio <onboarding@resend.dev>"). For thank-you emails use an address on your own verified domain.
//   SEND_CONFIRMATION  set to true to also send a thank-you email to the visitor (needs a verified domain)
// Replying to the email goes straight to the visitor, because their email is set as "reply_to".

const T = require('./_templates');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (e) { return res.status(400).json({ ok: false }); }
  b = b || {};

  if (b.website) return res.status(200).json({ ok: true }); // spam trap

  const name = String(b.name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 80);
  const email = String(b.email || '').trim().slice(0, 120);
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'missing or invalid fields' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'not configured' });
  const to = process.env.REVIEW_TO || 'sadafmashorihyd@gmail.com';
  const from = process.env.REVIEW_FROM || 'Portfolio <onboarding@resend.dev>';

  const mail = T.ownerMessage({ name, email, message });

  const send = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  try {
    // 1) email to Sadaf (replying to it answers the visitor)
    const r = await send({ from, to: [to], reply_to: email, subject: mail.subject, html: mail.html });
    if (!r.ok) return res.status(502).json({ ok: false });

    // 2) optional thank-you email to the visitor (needs a verified domain in Resend)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const t = T.thanksMessage({ name, replyTo: to });
      try { await send({ from, to: [email], reply_to: to, subject: t.subject, html: t.html, text: t.text }); } catch (e) { /* never fail the request because of this */ }
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};