# Putting the portfolio online (with email and saved reviews)

You need three free accounts: **GitHub**, **Vercel**, **Supabase**, and your **Resend** account (you already use it).

## 1. Supabase (saves the reviews)
1. supabase.com > New project (free). Pick any name and region.
2. Left menu > **SQL Editor** > New query > open `supabase.sql` from this folder, paste it, press **Run**.
3. Left menu > **Project Settings > API**. Copy these:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (safe to show on the website)
   - **service_role** key (SECRET. Never put it in index.html or on GitHub)

## 2. Resend (sends you the emails)
1. resend.com > API Keys > create a key.
2. The sender `onboarding@resend.dev` can only send to the email your Resend account was created with.
   Use that same email as `REVIEW_TO`, or verify your own domain in Resend later.

## 3. GitHub
Make a new repository and upload these files, keeping this layout:
```
index.html
api/review.js
api/contact.js
video.mp4        (only if the file is under 100 MB; otherwise skip it, the YouTube button works as a backup)
```
Do not upload `supabase.sql` or `SETUP.md` if you prefer, they are not needed by the website.

## 4. Vercel
1. vercel.com > Add New > Project > pick your GitHub repository > Deploy.
2. Project **Settings > Environment Variables**, add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | your Resend key |
| `REVIEW_TO` | `sadafmashorihyd@gmail.com` (must match your Resend account email, see step 2) |
| `SUPABASE_URL` | the Project URL |
| `SUPABASE_SERVICE_KEY` | the **service_role** key |

3. Press **Redeploy** so the variables take effect.

## 5. Tell the website about them
Open `index.html`, find the block near the bottom that says "Review form", and set:
```
var REVIEW_ENDPOINT = "/api/review";
var CONTACT_ENDPOINT = "/api/contact";
var SUPABASE_URL = "https://abcd1234.supabase.co";
var SUPABASE_ANON_KEY = "the anon public key";
```
Commit the change on GitHub. Vercel updates the site by itself.

## 6. Test it (do this once)
1. On your live site, send yourself a message from **Contact**. It should arrive in your email, and replying should answer the sender.
2. Send a test review from the **Reviews** form. You should get an email, and a row should appear in Supabase > **Table Editor > reviews** with `approved = false`.
3. In that row, change `approved` to `true`. Refresh your site: the review appears.
4. Delete the test rows afterwards.

## Every day use
- A review arrives by email AND is saved hidden. Check the person is real (their email is in the notification, and you can reply to it to ask).
- To show it: Supabase > Table Editor > reviews > set `approved` to true. To hide or remove it: set false or delete the row.
- Do not publish phone numbers or private details. For under-18 reviewers, delete their photo cell.
