// Vercel serverless function: receives a review from the website form.
//  1) saves it in Supabase with approved = false (so it is NOT shown yet), and
//  2) emails Sadaf, so she knows to check it. Replying to that email goes to the reviewer.
// To show a review on the website, open Supabase > Table Editor > reviews and set approved = true.
//
// Environment variables (Vercel > Settings > Environment Variables):
//   SUPABASE_URL          your project URL, for example https://abcd1234.supabase.co
//   SUPABASE_SERVICE_KEY  the SECRET service_role key (never put this in index.html)
//   RESEND_API_KEY        for the notification email
//   REVIEW_TO             where the notification goes (default: sadafmashorihyd@gmail.com)
//   REVIEW_FROM           sender (default: "Portfolio <onboarding@resend.dev>"). For thank-you emails use an address on your own verified domain.
//   SEND_CONFIRMATION     set to true to also send a thank-you email to the reviewer (needs a verified domain)

const T = require('./_templates');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (e) { return res.status(400).json({ ok: false }); }
  b = b || {};

  if (b.website) return res.status(200).json({ ok: true }); // spam trap: pretend it worked

  const name = String(b.name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 80);
  const country = String(b.country || '').trim().slice(0, 60);
  const title = String(b.title || '').trim().slice(0, 140);
  const review = String(b.review || '').trim().slice(0, 700);
  const email = String(b.email || '').trim().slice(0, 120);
  let linkedin = String(b.linkedin || '').trim().slice(0, 200);
  if (linkedin && !/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/\S*$/i.test(linkedin)) linkedin = ''; // only real LinkedIn links

  // photo is required
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.photo || ''));
  const photoOk = !!m && m[1].length < 600000;

  if (!name || !country || !title || !review || !photoOk || b.consent !== true || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'missing or invalid fields' });
  }

  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const key = process.env.RESEND_API_KEY;
  if (!(sbUrl && sbKey) && !key) return res.status(500).json({ ok: false, error: 'not configured' });

  // 1) save, hidden until approved
  let saved = false;
  if (sbUrl && sbKey) {
    try {
      const r = await fetch(sbUrl + '/rest/v1/reviews', {
        method: 'POST',
        headers: Object.assign({ apikey: sbKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, /^sb_/.test(sbKey) ? {} : { Authorization: 'Bearer ' + sbKey }),
        body: JSON.stringify({ name, country, title, review, email, linkedin: linkedin || null, photo: b.photo, approved: false }),
      });
      saved = r.ok;
    } catch (e) { saved = false; }
  }

  // 2) notify Sadaf by email (replying to it answers the reviewer)
  let emailed = false;
  if (key) {
    const to = process.env.REVIEW_TO || 'sadafmashorihyd@gmail.com';
    const from = process.env.REVIEW_FROM || 'Portfolio <onboarding@resend.dev>';
    const snippet =
`{
  text:${JSON.stringify(review)},
  name:${JSON.stringify(name)},
  role:${JSON.stringify(title)},
  country:${JSON.stringify(country)},
  link:${JSON.stringify(linkedin)},
  photo:"",
  thanks:""
},`;
    const mail = T.ownerReview({ name, country, title, review, email, linkedin, saved, snippet });
    const send = (payload) => fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    try {
      const r1 = await send({ from, to: [to], reply_to: email, subject: mail.subject, html: mail.html, attachments: [{ filename: 'photo.jpg', content: m[1] }] });
      emailed = r1.ok;
    } catch (e) { emailed = false; }

    // optional thank-you email to the reviewer (needs a verified domain in Resend)
    if (emailed && process.env.SEND_CONFIRMATION === 'true') {
      const t = T.thanksReview({ name, replyTo: to });
      try { await send({ from, to: [email], reply_to: to, subject: t.subject, html: t.html, text: t.text }); } catch (e) { /* never fail the request because of this */ }
    }
  }

  return saved || emailed ? res.status(200).json({ ok: true }) : res.status(502).json({ ok: false });
};