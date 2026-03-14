# 💬 Messages App

A beautiful, secure personal message-saving app built with **Supabase** (auth + PostgreSQL) and deployed on **Vercel**.

---

## 📁 Folder Structure

```
supabase-messages-app/
├── index.html            ← Entry point (auto-redirects)
├── login.html            ← Login page
├── signup.html           ← Signup page
├── dashboard.html        ← Protected dashboard
├── styles/
│   └── main.css          ← Design system (dark glassmorphism)
├── js/
│   ├── supabase-client.js  ← Supabase client initializer
│   ├── auth.js             ← Login / signup / logout logic
│   └── dashboard.js        ← Message save / load / render
├── vercel.json           ← Vercel routing + security headers
├── .env.example          ← Env var template
└── README.md
```

---

## 🗄️ Supabase Table Schema

Run this SQL in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```sql
-- Create messages table
create table public.messages (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  content    text        not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.messages enable row level security;

-- Policy: users can only SELECT their own messages
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = user_id);

-- Policy: users can only INSERT their own messages
create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Policy: users can only DELETE their own messages
create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = user_id);
```

---

## ⚙️ Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, give it a name, and set a strong database password.
3. Once the project is ready, go to **Project Settings → API**.
4. Copy:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public** key

### 2. Run the SQL Schema

1. In your Supabase dashboard, open **SQL Editor**.
2. Paste the SQL from the section above and click **Run**.

### 3. Configure Your App

Open all four HTML files (`index.html`, `login.html`, `signup.html`, `dashboard.html`) and replace the placeholder values in the `<script>` block at the top of each file:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://your-project-ref.supabase.co',  // ← paste here
  SUPABASE_ANON_KEY: 'your-anon-key',                    // ← paste here
};
```

> **Why is the anon key safe client-side?**  
> The anon key only allows operations permitted by your RLS policies. Since all policies require `auth.uid() = user_id`, unauthenticated requests cannot read or write any data.

### 4. Test Locally

Open `login.html` directly in your browser, **or** use a simple local server (required for ES modules to work):

```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx)
npx serve .
```

Then visit `http://localhost:3000`.

### 5. Deploy to Vercel

#### Option A — Via Vercel CLI

```bash
npm install -g vercel
cd supabase-messages-app
vercel
```

Follow the prompts. Vercel will auto-detect the static site.

#### Option B — Via Vercel Dashboard

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import your GitHub repo.
4. Leave all defaults (no build command needed for a static site).
5. Click **Deploy**.

> **No environment variables needed in Vercel** — the keys are embedded directly in the HTML files. If you prefer to keep them out of source control, you can use a build step to inject them.

---

## 🔒 Security Notes

| Feature | How it's implemented |
|---------|----------------------|
| Passwords | Hashed by Supabase Auth (bcrypt); never stored in plain text |
| Data isolation | PostgreSQL Row Level Security (RLS) — users can only access rows where `user_id = auth.uid()` |
| XSS prevention | All user-generated content is HTML-escaped before rendering |
| Auth session | JWT stored in `localStorage` by Supabase JS client; validated on every DB call |
| Security headers | `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` via `vercel.json` |

---

## 📸 Pages

| Page | URL | Description |
|------|-----|-------------|
| **Root** | `/` | Redirects to dashboard or login |
| **Login** | `/login.html` | Email + password sign-in |
| **Signup** | `/signup.html` | Create a new account |
| **Dashboard** | `/dashboard.html` | Compose and view your messages |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (dark glassmorphism), ES Modules JavaScript
- **Backend / Auth / DB**: [Supabase](https://supabase.com) (PostgreSQL + Supabase Auth)
- **Deployment**: [Vercel](https://vercel.com)
- **CDN**: `@supabase/supabase-js` via jsDelivr CDN
