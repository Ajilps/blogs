# Ajil's Notes

A reading-focused personal blog built with Next.js 16, MongoDB, and Vercel Blob.

## Features

- Latest posts on the home page
- Dedicated reading pages with related-story suggestions
- Markdown articles, cover images, photo sets, audio, and YouTube embeds
- Password-protected admin editor at `/admin/login`
- Direct browser uploads to a public Vercel Blob store
- Dynamic article metadata and social previews

## Local setup

Copy the keys from `.env.example` into the appropriate ignored local environment file. Required values are:

```text
MONGODB_URI
ADMIN_EMAIL
ADMIN_PASSWORD
SESSION_SECRET
```

Use `VERCEL_OIDC_TOKEN` with a newer OIDC-enabled Blob store, or `BLOB_READ_WRITE_TOKEN` with a legacy token-based store. Blog media must use a public Blob store.

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The editor is available at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Deploy to Vercel

Import the repository into Vercel and add `MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` to the project's environment variables. Connect an OIDC-enabled public Blob store to the project. Vercel supplies the Blob credential and deployment URL variables automatically.

The standard build command is:

```bash
npm run build
```
