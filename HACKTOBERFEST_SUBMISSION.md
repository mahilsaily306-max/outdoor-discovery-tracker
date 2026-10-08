---
title: "VERDA: AI That Gets Out of Your Way"
published: true
tags: hacktoberfest, touchgrass, opensource, ai
cover_image: https://raw.githubusercontent.com/your-username/verda/main/public/icon.svg
description: "A mobile-first outdoor companion using open-weight AI to help you leave the screen, touch grass, and explore the living world."
---

# VERDA: AI That Gets Out of Your Way

*Built for Hacktoberfest 2026 Week 1 Challenge: **Touch Grass**.*

---

## 🌿 The Problem: The AI Attention Trap

Most artificial intelligence tools built over the last two years share an unspoken design goal: **maximize screen time.**

They want you chatting longer, generating more iterations, checking notifications, and keeping your eyes anchored to a glowing rectangle. Even when tech products claim to promote "wellness," they often trap users in digital metrics—tracking steps, counting calories, and encouraging you to log every micro-action while ignoring the living world around you.

When we attempt to go outside and "touch grass," the pull of the screen follows us into the park. At the first quiet moment or pause along a trail, the phone comes back out.

---

## 💡 The Solution: VERDA

**VERDA does the exact opposite.**

Its design philosophy is simple:

> **AI creates the mission.**  
> **The user leaves the screen.**  
> **The physical world becomes the interface.**

Instead of engaging in endless dialogue, you spend less than **60 seconds** on your screen:
1. **Choose an outdoor activity:** Walk, Run, Explore, Birding & Audio, Gardening, or Nature Discovery.
2. **Choose a duration & challenge:** 15m, 30m, 45m, or 60m at Easy, Moderate, or Challenging.
3. **AI formulates your mission:** Generates sensory, mindful objectives focused on presence, sight, sound, and natural textures.
4. **Step into Screen-Away Mode:** A dedicated, ultra-minimal screen with an ambient, drift-free timer, Screen Wake Lock support, and an optional audio briefing (*"🔊 Hear Mission"*) so you can pocket your phone immediately.
5. **Explore without checking your phone:** The screen instructs you: *"Your phone isn't needed right now. Go touch grass."*
6. **Return & Reflect:** Check off what you noticed, record photos or voice observations, and let open-weight AI synthesize a structured outdoor journal entry that honors what you actually experienced—without hallucinating fake species or fitness metrics.

---

## 🏗️ Open AI Architecture

VERDA is built around an open AI provider abstraction:

```text
                     VERDA (Next.js 16 + PWA)
                                 │
                                 ▼
                       AIProvider Abstraction
                    (@/lib/ai/types.ts: AIProvider)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
           OllamaProvider                  DemoProvider
      (http://127.0.0.1:11434)        (Zero-Setup Local Logic)
                 │                               │
        Open-Weight Models              Dynamic Heuristics
      (Gemma 2 2B / Llama 3.2)        (Offline Judging Default)
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Zod Schema Output Guard
                                 ▼
                     Deterministic Safety Check
                    (Rejects Hazards & Trespassing)
                                 ▼
                     Browser Storage (IndexedDB)
                    (Local-First Trails & Discoveries)
```

### Why Open Innovation Matters in Nature

1. **Trail Autonomy:** By running local open weights via Ollama, mission generation and reflection synthesis work on remote nature trails with zero cellular service.
2. **Zero Cloud Telemetry & Data Sovereignty:** Your outdoor trails, audio observations, and photos stay stored strictly in your browser's IndexedDB. No user accounts, tracking cookies, or cloud databases.
3. **Model Interchangeability:** Open weights give users freedom to benchmark `gemma2:2b`, `llama3.2:1b`, or custom fine-tunes without proprietary API lock-in.
4. **Honest AI Claims:** VERDA distinguishes between `Local AI · Ollama` and `Demo AI` transparently in the UI.

---

## 🛡️ Physical Safety Interceptor

Outdoor safety cannot be left to probabilistic model responses. VERDA implements a deterministic client-side safety interceptor (`lib/safety/interceptor.ts`) that screens both missions and reflections against:
* Trespassing or climbing onto private property
* Walking near busy highways, freeways, or active railway tracks
* Approaching, feeding, or touching dangerous wildlife
* Venturing near cliff edges, thin ice, or structural hazards
* Walking outdoors during severe thunderstorms or blizzards

If an LLM produces an unsafe instruction, it is automatically rejected or sanitized before ever reaching the user.

---

## 📱 Mobile-First Sensory Experience

* **Radical Screen-Away Mode:** Large, readable typography, serene breathing animation, high-contrast outdoor readability, and OLED-friendly power saver mode.
* **Drift-Free Resilient Timer:** Uses timestamp diffs (`Date.now() - startedAtMs`) to prevent time drift when mobile browsers sleep or background the tab.
* **Audio Mission Briefing:** Uses the browser's Web Speech API (`SpeechSynthesis`) to read the briefing aloud so you never have to squint at the screen outdoors.
* **Field Discoveries:** In-browser canvas image compression ensures captured photos are lightweight (~80–150 KB) and never overwhelm IndexedDB storage.
* **Voice Observations:** Web Speech API (`SpeechRecognition`) lets you dictate field notes while walking.
* **Authentic Streaks & Stats:** Calculates genuine streaks based on consecutive calendar day boundaries and actual outdoor minutes. No fabricated step counts or fake health metrics.
* **Web Share Integration:** Generate clean, shareable outdoor journal cards directly to native device share sheets.

---

## 🏃 Try VERDA Yourself

* **Source Code:** [https://github.com/your-username/verda](https://github.com/your-username/verda)
* **Zero-Setup Quickstart:**
  ```bash
  git clone https://github.com/your-username/verda.git
  cd verda
  npm install
  npm test
  npm run dev
  ```
* Open `http://localhost:3000` — runs instantly in Demo Mode with zero configuration!
* To connect local open-weights: run `ollama serve`, pull `gemma2:2b`, and select `Local AI · Ollama` in Settings.

---

## 🌿 Conclusion

Technology should enrich our relationship with the physical world, not sever it. 

With VERDA, artificial intelligence steps in for sixty seconds to inspire your curiosity, and then politely steps out of the way so you can touch grass.
