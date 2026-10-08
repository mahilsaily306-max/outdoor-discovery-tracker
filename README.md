# VERDA

> **AI that gets out of your way.**

A mobile-first outdoor companion built for **Hacktoberfest 2026 Week 1: "Touch Grass"**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Open--Weights-black?logo=ollama)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 🌿 Overview

Most AI applications compete aggressively for your attention. They incentivize continuous typing, conversational loops, and endless screen time.

**VERDA does the exact opposite:**

Technology should serve as a launchpad to physical reality, not a substitute for it. VERDA uses open-weight AI briefly—for under 60 seconds—to formulate an intentional, sensory reason to step outside, and then immediately asks you to pocket your phone.

```text
CREATE MISSION → REVIEW BRIEFING → START MISSION → SCREEN-AWAY MODE →
GO OUTSIDE → RECORD DISCOVERIES → AI REFLECTION → OUTDOOR JOURNAL
```

---

## 💡 Why VERDA?

Screens isolate us from sensory reality. When people attempt to "touch grass," they often succumb to habit: pulling out their phones at the first sign of quiet, checking notifications, or scrolling feeds.

VERDA flips this dynamic:
1. **AI creates the mission:** Formulates sensory objectives tailored to your duration, activity, and environment.
2. **The user leaves the screen:** A dedicated, ultra-minimal Screen-Away Mode keeps a glanceable timer, offers a voice briefing, and advises: *"Your phone isn't needed right now. Go explore."*
3. **The physical world becomes the interface:** You focus on leaf shapes, bird calls, canopy winds, and earthy scents.
4. **Reflect on return:** Log real photos or voice notes, generate a structured AI debrief that never invents fake observations, and build an authentic outdoor streak.

---

## 🏗️ Open AI Architecture

VERDA decouples AI model execution from application logic using a clean provider abstraction:

```text
                        VERDA (Next.js 16 PWA)
                                  │
                                  ▼
                        AIProvider Interface
                     (@/lib/ai/types.ts: AIProvider)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
            OllamaProvider                  DemoProvider
       (http://127.0.0.1:11434)        (Zero-Setup Heuristic Engine)
                  │                               │
        Local Open-Weight Models            Instant Generation
      (Gemma 2 2B / Llama 3.2 1B)         (No Server / No API Keys)
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼
                      Zod Schema Validation Guard
                    (Structured JSON Output Parsing)
                                  ▼
                     Deterministic Safety Check
                    (Rejects Hazards & Trespassing)
                                  ▼
                      Browser Storage (IndexedDB)
                    (Local-First Trails & Discoveries)
```

---

## 🔓 Why Open Innovation Matters in Nature

For an outdoor tool, open-source and open-weight AI architectures provide fundamental advantages over closed cloud APIs:

1. **Local Trail Independence:** With Ollama running locally (or with the built-in offline engine), you can generate missions and reflections on remote trails with spotty or nonexistent cellular service.
2. **True Data Sovereignty:** Your outdoor habits, photos, voice notes, and approximate coordinates are never transmitted to cloud analytics databases or used to train third-party models.
3. **Model Autonomy:** Developers and users can freely swap open weights—benchmarking `gemma2:2b`, `llama3.2:1b`, `mistral`, or `qwen2.5`—without vendor lock-in.
4. **Honest AI Claims:** The system transparently labels active models (`Local AI · Ollama` vs `Demo AI`) and never claims offline AI unless a genuine local model is running.

---

## ✨ Implemented Features

### 1. Mission Generation System
* **6 Sensory Activities:** Nature Walk, Trail Run, Urban / Trail Explore, Birding & Audio, Gardening & Soil, and Micro-Texture Discovery.
* **Duration & Challenge:** 15, 30, 45, or 60 minutes with Easy, Moderate, or Challenging tiers.
* **Optional Environment Hints:** Add local context (e.g., *"city park with duck pond"* or *"rainy afternoon"*).

### 2. Radical Screen-Away Mode
* **Minimalist High-Contrast UI:** Large, readable countdown timer with a calm breathing animation and OLED-friendly true black mode.
* **Drift-Free Resilient Timer:** Tracks elapsed time using system timestamps (`Date.now() - startedAtMs`) rather than interval increments, preventing timer drift during mobile tab sleep.
* **Screen Wake Lock API:** Prevents screen timeout while glanceable timer is active, with automatic re-acquisition on visibility changes.
* **Audio Mission Briefing:** Uses the Web Speech API (`SpeechSynthesis`) so you can hear your mission read aloud and pocket your phone immediately.
* **Crash & Refresh Recovery:** Active missions survive browser reloads and mobile backgrounding.
* **Empathetic Early Exit:** If you return early, VERDA celebrates your time outside (*"Every bit outside counts"*).

### 3. Field Discovery Recording
* **Camera Capture:** Invokes native device camera (`capture="environment"`) to document interesting flora, fauna, or landscapes.
* **Canvas Image Compression:** Compresses photos directly in the browser to max 1080px JPEG (~80–150 KB), preserving IndexedDB quotas.
* **Voice Observation:** Speech-to-text powered by browser `SpeechRecognition`, allowing hands-free voice notes while walking.
* **Coarse Location Context:** Optional coarse coordinates rounded to ~1 km for privacy.
* **Honest Observation Records:** Photos are labeled strictly as stored journal records—never with fabricated AI species identifications.

### 4. Post-Mission AI Reflection & Journal
* **Field Objective Checklist:** Verify which outdoor objectives you accomplished.
* **Synthesized Debrief:** AI reflects on your actual supplied observations, photo count, and outdoor minutes without hallucinating facts.
* **Reflection Safety Guardrail:** Scans reflection text and next-adventure recommendations to ensure no hazardous or trespassing suggestions are introduced.
* **Native Web Share:** Native device share sheet integration with formatted clipboard copy fallback.

### 5. Timeline, Streaks & Statistics
* **Genuine Outdoor Streaks:** Real consecutive-day streak calculation derived from actual stored session timestamps.
* **Authentic Outdoor Metrics:** Aggregates verified outdoor minutes, completed sessions, and discovery counts. No fake step counters or health metrics.
* **Responsive Timeline:** View, revisit, or delete previous journal entries.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16.3.8 (App Router, Turbopack)
* **Language:** TypeScript 5.x (Strict mode)
* **Styling:** Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans typography
* **Validation:** Zod v4 schemas (`MissionSchema`, `AIMissionRawOutputSchema`, `JournalReflectionSchema`)
* **Storage:** IndexedDB via `idb-keyval` (Local-first persistence)
* **AI Engine:**
  * **Local AI:** Ollama HTTP REST API (`/api/ollama` bridge)
  * **Demo AI:** Pure deterministic local heuristic generator (zero-setup)
* **Browser Web APIs:** Screen Wake Lock, Web Speech API (Synthesis & Recognition), Geolocation, Web Share, HTML5 Canvas

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js** v20.x or v22.x
* **npm** (or pnpm / yarn)

### 2. Installation & Run

```bash
# Clone the repository
git clone https://github.com/your-username/verda.git
cd verda

# Install dependencies
npm install

# Run automated test suite
npm test

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser or mobile device.

---

## ⚡ Demo Mode (Zero-Config Judging)

VERDA ships with **DemoProvider** enabled out of the box:

* **Zero setup required:** No API keys, no local daemons, and no external network connections needed.
* **Full end-to-end loop:** Generates missions, runs the Screen-Away Mode, accepts photos/voice notes, synthesizes dynamic reflections incorporating your real discoveries, and logs to your journal.
* Ideal for hackathon judges and instant review.

---

## 🦙 Running with Local Ollama (Open Weights)

To run VERDA with a real, local open-weight LLM on your machine:

1. **Install Ollama:**
   Download from [ollama.com](https://ollama.com) (macOS, Linux, Windows).

2. **Pull a lightweight open-weight model:**
   ```bash
   ollama pull gemma2:2b
   # or: ollama pull llama3.2:1b
   ```

3. **Start the Ollama daemon:**
   ```bash
   ollama serve
   ```

4. **Configure VERDA:**
   * Open VERDA at [http://localhost:3000](http://localhost:3000).
   * Click the **AI Provider status pill** in the top header.
   * Select **Local AI · Ollama**.
   * Enter your endpoint (default: `http://127.0.0.1:11434`) and model name (`gemma2:2b`).
   * Click **Test Connection** to confirm connectivity.
   * Click **Save Settings**.

---

## 🛡️ Safety & Privacy Principles

* **Deterministic Safety Interceptor:** Every generated mission and AI reflection passes through heuristic pattern matching blocking instructions involving trespassing, railway tracks, dangerous wildlife feeding, cliff ledges, and severe storms.
* **Privacy By Default:** All missions, observations, photos, and journal entries are persisted strictly in your browser's IndexedDB. No user accounts, cloud databases, or third-party tracking scripts.
* **No Fabricated Data:** VERDA never invents step counts, calories, or species identifications. If you photograph a tree, it is saved as your visual record of a tree.

---

## 🧪 Testing & Verification

Run the automated verification suite:

```bash
npm test
```

The test engine validates:
* DemoProvider mission generation across all 6 outdoor activities
* Dynamic AI reflection synthesis incorporating user discoveries
* Zod schema compliance (`AIMissionRawOutputSchema`, `JournalReflectionRawSchema`, `DiscoverySchema`)
* Mission and reflection safety interceptors (hazardous prompt blocking and sanitization)
* Authentic streak and outdoor statistics calculations

To run a production build:

```bash
npm run build
```

---

## 📱 Browser Capabilities & Graceful Degradation

| Browser API | Purpose | Graceful Fallback |
| :--- | :--- | :--- |
| **Screen Wake Lock** | Keeps glanceable timer active outdoors | Falls back silently; timer still recalculates accurately via timestamps on wake. |
| **SpeechSynthesis** | Reads audio mission briefing | Button is hidden if browser lacks speech synthesis support. |
| **SpeechRecognition** | Transcribes voice observations | Friendly notification; text input is always available. |
| **Geolocation** | Records approximate coarse context | Optional; coordinates are never requested on startup. |
| **Web Share** | Native mobile sharing sheet | Fallback copy-to-clipboard button. |
| **Camera (`capture`)** | Snaps discovery photo | Standard file picker dialog on desktop/unsupported devices. |

---

## 🌿 The Hacktoberfest Story

> **Most AI tools compete for our attention.**
>
> **VERDA uses AI for the opposite reason: to create a mindful reason to step outside, and then get out of your way.**
>
> **AI creates the mission. You put the phone away. The living world becomes the interface.**

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
