# Asif National — Student Tracker

A private, mobile-friendly student progress management system with Google Sheets sync and email-based access control.

---

## 📁 Project Structure

```
/
├── index.html          ← Main app (safe to push to GitHub)
├── config.js           ← 🔒 PRIVATE — your secrets (NOT on GitHub)
├── apps-script.gs      ← Google Apps Script backend code
├── .gitignore          ← Protects config.js from being pushed
└── README.md           ← This file
```

---

## 🚀 Setup (do once)

### Step 1 — Fill in your config

Open `config.js` and fill in:

```js
const CONFIG = {
  ADMIN_EMAIL:     'thewolion@gmail.com',       // Your Gmail — full admin access
  ADMIN_KEY:       'your-secret-key',            // Change this to something new
  SHEET_ID:        'your-google-sheet-id',       // From your Sheet URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
};
```

---

### Step 2 — Set up Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code, paste the full contents of `apps-script.gs`
4. Click **Save** (💾)
5. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → copy the URL
7. Paste that URL into `config.js` as `APPS_SCRIPT_URL`

---

### Step 3 — Host the site

**Option A — Netlify (easiest, free):**
1. Go to [netlify.com](https://netlify.com) → drag your project folder to "Deploy manually"
2. Done. You get a live URL instantly.

**Option B — GitHub Pages:**
1. `git init` in your project folder
2. `git add index.html apps-script.gs README.md .gitignore` ← do NOT add config.js
3. `git commit -m "initial commit"`
4. Push to GitHub, enable Pages in Settings → Pages
5. Upload `config.js` separately via Netlify or another host (never GitHub)

**Option C — Any web host:**
Upload all files including `config.js` via FTP/cPanel.

---

## 🔒 Security

- `config.js` is listed in `.gitignore` — it will **never** be pushed to GitHub
- The admin key in `config.js` is verified on every write to Google Sheets
- Only emails you add in the **Access** tab can log in
- Your Gmail (`ADMIN_EMAIL`) always has admin access regardless of the sheet

---

## 👥 Adding users

1. Log in as admin (`thewolion@gmail.com`)
2. Go to the **Access** tab
3. Enter the teacher's or director's Gmail and select their role
4. Click **Add to Approved List**

They can then log in at your site URL using their Gmail.

---

## ✏️ Updating the Apps Script

If you re-deploy the Apps Script, you must create a **new deployment** (not edit the existing one) to get a new URL. Then update `APPS_SCRIPT_URL` in `config.js`.
