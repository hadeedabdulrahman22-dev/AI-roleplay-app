# Plotta & Character AI - 3-Panel Webtoon Comic Studio

A standalone, mobile-responsive dark-mode web application built with **Vite + React + Tailwind CSS**, styled like Plotta and Character.ai. 

Features interactive 3-panel sequential comic strip roleplay where generated images are directly based on **both the user's input message and the character's reply**, rendered via **AI Horde** crowdsourced GPU workers.

---

## 🌟 Key Features

- **Plotta & Character.ai Aesthetic**: Sleek glassmorphism surfaces, neon accents, responsive mobile navigation drawer, and animated comic scanlines.
- **3-Panel Sequential Webtoon Roleplay**:
  - **Panel 1 (The User's Move)**: Visually depicts the user's action and character's immediate acknowledgement.
  - **Panel 2 (The Character's Reaction)**: Captures the character's emotional face, blush, and eye contact.
  - **Panel 3 (Escalation / Climax)**: Pushes the moment forward into an intimate lean-in, touch, or dramatic turning point.
- **Parallel AI Horde Image Generation**:
  - Generates all 3 panels in parallel (`Promise.all`) using vertical $(512 \times 640)$ manhwa formatting.
  - Individual **Regenerate Panel** controls, full-screen zoom viewer, and image download.
  - Scene action prioritized in prompt tokens for high-fidelity character interaction without head cropping.
- **Dynamic Story Progression**:
  - **"Continue Comic Story ➡️"** button for 1-click continuation without typing.
  - Roleplay action formatting: physical actions inside `*asterisks*` render in italicized muted serif text, and spoken dialogue in crisp text.
- **Persona & Character Customization**:
  - **User Persona Appearance Tags** (e.g. `1boy, handsome young man, dark hair, sharp jawline, stylish casual clothes`) for consistent 2-person panels.
  - Character Creator & Editor with avatar presets, personality, backstory, and visual tags.
  - Pre-loaded with two distinct demo characters: **Elena Vance** (Romantic Drama Heiress) and **Kaelen Emberhart** (Fantasy Rogue Spellblade).
- **Settings (Stored in `localStorage`)**:
  - OpenRouter API Key configuration.
  - Model selector dropdown featuring `openrouter/free`, `google/gemma-4-31b-it:free`, `qwen/qwen3.8-27b:free`, `nvidia/nemotron-3-super-120b-a12b:free`, and custom model IDs.
  - AI Horde API Key input (defaults to `0000000000` anonymous tier, which has the lowest priority; a free key from https://aihorde.net/register is much faster).
  - Auto-Generate Comic Panels toggle.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/hadeedabdulrahman22-dev/AI-roleplay-app.git
cd AI-roleplay-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## ☁️ Deployment

This project is 100% client-side with no server runtime requirements. It deploys effortlessly to **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 📜 License

MIT License
