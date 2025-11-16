# Fake News Detection System

## Overview

This project is a **Fake News Detection System** built as part of a college engineering assignment. The application allows users to analyze text or URLs to identify whether the provided information is likely to be fake or real. It also supports batch processing, maintains user history, and provides an admin dashboard for managing analysis data.

---

## Features

### 🔍 Fake News Analysis

* Analyze **text** input.
* Analyze **news article URLs**.
* Uses an AI-driven detection pipeline.

### 📦 Batch Processing

* Upload multiple pieces of content for bulk analysis.

### 📊 Admin Dashboard

* Manage all user submissions.
* View analytics and performance metrics.

### 📁 User History

* Users can view their previous analysis results.

### 📤 Social Sharing

* Share verified results on social platforms.

### 🎨 Modern UI

* Built with clean, responsive, production-quality design.

---

## Tech Stack

* **React** (TypeScript)
* **Vite**
* **Tailwind CSS**
* **shadcn-ui**
* **Supabase** (for authentication & database)

---

## Project Setup

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start Development Server

```sh
npm run dev
```

The development server will start with auto‑reload.

---

## Deployment

This project can be deployed to any static hosting provider such as **Vercel**, **Netlify**, or **Cloudflare Pages**.

1. Build the project:

```sh
npm run build
```

2. Deploy the contents of the `dist/` folder to your hosting platform.

---

## Folder Structure

```
project-root/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Environment Variables

Create a `.env` file with the required keys:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add additional API keys depending on your fake‑news detection logic.

---

## How It Works

1. User inputs text or URL.
2. Backend/AI model processes the data.
3. System returns a probability‑based authenticity score.
4. Result is stored in Supabase for history & admin review.

---

## Future Enhancements

* Improve accuracy with advanced NLP models.
* Add browser extension for real‑time news validation.
* Enable user‑generated reporting.

---

## License

This project is created solely for **academic purposes**.
