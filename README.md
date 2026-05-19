# RJ Visakh CMS

Custom blog CMS for [rjvisakh.com](https://rjvisakh.com) — Next.js 15 + MongoDB + NextAuth + Tailwind.

- **Admin UI** at `/admin` — login, list posts, WYSIWYG editor (TipTap) with toolbar, inline image upload (Vercel Blob), publish/unpublish, delete.
- **Public REST API** (CORS-enabled) for the Astro site to consume:
  - `GET /api/posts` — list published posts (supports `?limit=10&tag=pmp&html=1`)
  - `GET /api/posts/[slug]` — single published post (returns markdown + rendered HTML)
- **Auth**: NextAuth v5 credentials provider, bcrypt-hashed admin password seeded via script.

---

## Local development

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env`
```bash
cp .env.example .env
```

Fill in:
- `MONGODB_URI` — MongoDB Atlas connection string (create free cluster at https://mongodb.com/atlas)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — your initial admin credentials
- `PUBLIC_CORS_ORIGIN` — the Astro site's origin (e.g. `https://www.rjvisakh.com`); use `*` only in dev
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` — required only if you want to upload images in the editor.
  Create an S3 bucket and an IAM user with `s3:PutObject` permission. The bucket must allow public read on uploaded objects (bucket policy or ACL on `posts/*`).
  Optional `AWS_S3_PUBLIC_URL` — set to your CloudFront distribution URL (no trailing slash) if you serve uploads through a CDN.

### 3. Seed the admin user
```bash
npm run seed
```

### 4. Run dev server
```bash
npm run dev
```
Open http://localhost:3001 — you'll be redirected to `/login`.

---

## Deploy to Vercel

1. **Push this folder to a GitHub repo** (separate repo from the Astro site is recommended).
2. **Import the repo** at https://vercel.com/new.
3. **Set environment variables** in Vercel project settings (same as `.env.example`).
4. **Deploy**. Vercel auto-detects Next.js.
5. **Seed the admin once** locally with the production `MONGODB_URI`:
   ```bash
   MONGODB_URI=<prod-uri> ADMIN_EMAIL=<email> ADMIN_PASSWORD=<pwd> npm run seed
   ```

That's it. Your CMS is live at `https://<your-project>.vercel.app`.

---

## Consuming the API from the Astro site

```ts
// src/lib/cms.ts in the Astro project
const CMS_API = "https://<your-cms>.vercel.app/api";

export async function getPosts() {
    const res = await fetch(`${CMS_API}/posts`);
    return (await res.json()).posts;
}

export async function getPost(slug: string) {
    const res = await fetch(`${CMS_API}/posts/${slug}`);
    if (!res.ok) return null;
    return res.json();
}
```

Then in `src/pages/blog.astro` and `src/pages/blog/[slug].astro` replace the hardcoded arrays with calls to these.

---

## API reference

### `GET /api/posts`
Public. Returns published posts only.

Query params:
| Param  | Default | Description |
|--------|---------|-------------|
| `limit`| 50      | Max posts (capped at 100) |
| `tag`  | —       | Filter by tag |
| `html` | 0       | When `1`, includes `contentHtml` for each post |

### `GET /api/posts/[slug]`
Public. Returns a single published post (markdown `content` + rendered `contentHtml`). 404 if not published / not found.

### `POST /api/admin/posts`
Auth-required. Body: `{ title, slug, excerpt, content, coverImage, tags[], author, published }`. Creates a post.

### `PATCH /api/admin/posts/[id]`
Auth-required. Partial update. Sets `publishedAt` automatically on first publish.

### `DELETE /api/admin/posts/[id]`
Auth-required. Permanently removes the post.
