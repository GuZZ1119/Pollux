# Pollux

**A permissions-aware AI communication copilot for email and team chat.**

Pollux helps users review messages, generate context-aware replies, and send responses through the original platform — while keeping the user in control of every meaningful action.

**Demo video:** https://youtu.be/YgdlLQ0dSTA

---

## Overview

Pollux is a full-stack AI communication product built around a simple trust model:

- users sign in explicitly
- users connect communication platforms intentionally
- AI helps with drafting, summarizing, and prioritizing
- outbound actions remain visible and user-approved

Instead of copying messages into a separate AI tool, Pollux brings identity, account connection, message context, reply generation, and sending into one product surface.

### Today, Pollux supports

- **Gmail**: real inbox reading, real message detail retrieval, AI reply generation, real sending
- **Slack**: real OAuth connection, real message reading, AI reply generation, real sending
- **Dashboard / Inbox / Settings**: polished product UI for daily use
- **Style Personalization**: custom reply style learned from presets, writing samples, or Gmail sent mail
- **Daily Brief**: AI-assisted summary of what happened today and what needs attention
- **Persistence**: database-backed token storage, style profile storage, and send logs

---

## The Problem

Modern communication is fragmented.

Important work is split across email, chat, and notifications. Most AI tools can generate text, but they often sit outside the real workflow. They do not clearly show what data they can access, what actions they are allowed to take, or how much control the user still has once the AI is involved.

That becomes a bigger issue when AI stops being just a writing tool and starts acting on behalf of users.

A trustworthy communication copilot needs more than good text generation. It needs:

- clear identity
- explicit platform connection
- scoped access
- understandable permission boundaries
- strong human review before high-impact actions

Pollux is built around that model.

---

## What Pollux Is

Pollux is a permissions-aware AI communication copilot.

It lets users connect the platforms they already use, view real messages in one interface, generate multiple AI reply options, personalize reply style, and send the final response through the original provider.

### Core workflow

1. Sign in with Auth0
2. Connect Gmail and/or Slack
3. View real inbound messages
4. Ask Pollux to generate reply candidates
5. Review and optionally edit the draft
6. Send through the original platform
7. See activity reflected in summaries, send logs, and the unified inbox flow

---

## Why This Matters

Pollux is not only about replying faster.

It is a product exploration of a larger question: **how should AI systems act on behalf of users inside explicit authorization boundaries?**

Pollux makes that question concrete by showing:

- explicit connection flows instead of hidden access
- platform-aware actions rather than detached text generation
- user review before sending
- separation between identity, connected accounts, and AI-assisted actions
- a UI that makes the workflow feel understandable rather than magical

That makes Pollux relevant both as a useful communication product and as a practical prototype for safer agent authorization patterns.

---

## Core Features

### Unified AI inbox

- Aggregate connected communication channels into one product surface
- Support provider-aware rendering for Gmail and Slack
- Show source, risk, message status, and interaction state in one view

### Real Gmail integration

- Gmail OAuth connection flow
- Real inbox retrieval through Gmail API
- Message detail parsing with MIME handling
- HTML email sanitization with DOMPurify
- Attachment metadata extraction
- Real reply sending via `gmail.users.messages.send`
- Thread-aware sending using Gmail thread context

### Real Slack integration

- Slack OAuth connection flow
- Real message retrieval from accessible channels and DMs
- Provider-aware message fetch and send paths
- Real reply sending via Slack API with thread support

### AI reply generation

- Multiple reply candidates per message
- OpenAI-backed generation with graceful fallback
- Prompt-injection-aware prompt design
- Provider-sensitive tone differences between email and chat
- Reply source labeling for transparency

### Style Personalization V1

Users can build a personalized writing profile through four paths:

- start from a preset
- learn from recent Gmail sent mail
- upload writing samples
- paste writing samples directly

The resulting style profile can include:

- tone rules
- banned phrases
- sign-off patterns
- greeting patterns
- directness level
- hedge-word preferences
- representative writing examples
- user guardrails

### Daily Brief

- Summarize today’s communication activity
- Highlight high-attention items
- Extract action items
- Break down activity by provider
- Support rule-based generation with AI upgrade and fallback
- Cache summary generation for better stability and cost control

### Reliability and persistence

- Gmail tokens persisted to Neon PostgreSQL
- Slack tokens persisted to Neon PostgreSQL
- Style profiles persisted to Neon PostgreSQL
- Send logs persisted for traceability
- Backend-driven message fetching for reply and send consistency
- HMR-safe in-memory caching patterns for local development
- Better local development handling for ngrok / OAuth domain consistency

---

## Security, Authorization, and User Control

Pollux is designed so that AI assistance stays inside explicit boundaries.

### Principles

- **Explicit sign-in**
  - User identity is handled through Auth0.

- **Explicit provider connection**
  - Gmail and Slack access are granted through dedicated OAuth flows.
  - Platform access is not assumed or bundled invisibly.

- **Scoped access**
  - Pollux only operates with the scopes granted to the connected provider.
  - Gmail and Slack connections are handled separately.

- **Human-in-the-loop sending**
  - AI drafts suggestions.
  - The user still reviews and approves the message before it is sent.

- **Backend consistency for sensitive actions**
  - Reply generation and sending prefer backend-fetched real message context rather than trusting the frontend alone.
  - This reduces mismatch between what the user saw and what the system sends.

- **Visible action channels**
  - Send results are surfaced clearly, including whether a reply was sent through a real provider path or a fallback path.

- **Safe rendering**
  - HTML email content is sanitized before rendering.
  - Suspicious prompt-like instructions in inbound messages are treated as untrusted content in the generation pipeline.

### Auth model in practice

Pollux separates three layers:

1. **Who the user is**  
   Auth0 session and identity

2. **What Pollux can access**  
   provider-specific OAuth connection state and granted scopes

3. **What Pollux can do**  
   summarize, draft, and prepare replies — with the final send action remaining user-approved

That separation is core to the product.

---

## Demo

- **Video:** https://youtu.be/YgdlLQ0dSTA
- **Live app:** https://transnationally-jauntier-fritz.ngrok-free.dev
- **Repository:** https://github.com/GuZZ1119/Pollux

The video is the fastest way to understand the full Gmail / Slack / AI reply flow.

---

## How It Works

### User flow

1. Sign in to Pollux
2. Connect Gmail or Slack
3. Open the Inbox
4. Pick a message
5. Generate AI reply candidates
6. Select or edit a draft
7. Send through Gmail or Slack
8. Review Daily Brief or continue triage

### Technical flow

1. Auth0 establishes authenticated product access
2. Gmail or Slack OAuth connects the provider account
3. Provider adapters fetch normalized message data
4. Message detail is parsed and normalized into shared internal types
5. Reply generation builds prompt context from:
   - message content
   - sender / subject / provider
   - user style profile
   - representative writing examples
   - guardrails
6. The user chooses a draft
7. The backend re-fetches authoritative message context when needed
8. The message is sent through the platform-native API
9. Send logs and style/persistence state are stored in PostgreSQL

---

## Architecture Overview

Pollux is structured as a modern full-stack web application with provider adapters.

### Main layers

#### Frontend
- Next.js 15
- App Router
- React 19
- Tailwind CSS 4
- polished Dashboard / Inbox / Settings experience

#### Identity and access
- Auth0 for product login and session handling
- provider-specific OAuth flows for Gmail and Slack

#### Integrations
- Gmail OAuth + Gmail API
- Slack OAuth + Slack Web API
- provider adapter layer for inbox and send paths
- backend message fetchers for authoritative message detail retrieval

#### AI layer
- OpenAI-based reply generation
- style-aware prompt composition
- Daily Brief AI summary path with fallback
- injection-aware prompt structure

#### Persistence
- Prisma ORM
- Neon PostgreSQL
- token storage
- style profile storage
- send log storage

#### Reliability utilities
- HMR-safe global caches for local development
- summary caching
- event logging
- provider-aware fallbacks
- ngrok-safe callback redirect handling via `APP_BASE_URL`

---

## Tech Stack

### Product and frontend
- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 4

### Backend and data
- Next.js Route Handlers
- Prisma 6
- Neon PostgreSQL

### Authentication and authorization
- Auth0
- Google OAuth
- Slack OAuth

### Platform APIs
- Gmail API
- Slack Web API

### AI
- OpenAI API
- `gpt-4o-mini` for reply generation and summary generation

### Security and content handling
- DOMPurify for sanitized HTML email rendering

### Tooling
- ESLint 9
- PostCSS
- ngrok for public local callback testing

---

## What Was Built During the Hackathon

Pollux was significantly advanced during the hackathon period.

It moved from a minimal runnable scaffold to a multi-platform, persistence-backed product prototype with a polished UI and a complete end-to-end demo flow.

### Major shipped progress

- built the initial full-stack scaffold with typed domain models and mock adapters
- added Auth0-based login flow
- added Gmail OAuth connection flow
- replaced mock Gmail inbox with real Gmail inbox retrieval
- added MIME parsing, HTML rendering, and attachment metadata extraction
- connected OpenAI-based reply generation
- implemented real Gmail sending
- introduced risk classification, inbox metrics, filtering, and event logging
- polished the Inbox and Settings UX for demo quality
- added Daily Brief and provider-agnostic summarization
- shipped Style Personalization V1
- migrated key state to Neon PostgreSQL
- added backend-owned message fetching for more reliable reply/send behavior
- upgraded Slack from mock to a real second platform
- fixed OAuth redirect consistency for local + ngrok development
- finalized the product into a submission-ready demo

This is not a static concept repo. It is a working product prototype with real provider integrations and a real user flow.

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm
- a Neon or PostgreSQL database
- Auth0 application credentials
- Google OAuth credentials
- Slack OAuth credentials
- OpenAI API key for live generation

### Install

```bash
npm install
```

### Configure environment variables

Create `.env.local` from `.env.example` and fill in your credentials.

Typical variables include:

```bash
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
APP_BASE_URL=http://localhost:3000

DATABASE_URL=

OPENAI_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=
```

### Prepare the database

```bash
npx prisma generate
npx prisma db push
```

### Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Local OAuth Setup Notes

### Auth0

Configure your Auth0 application with callback/logout origins for local development.

Typical values:

- callback URL: `http://localhost:3000/auth/callback`
- logout URL: `http://localhost:3000`

If using ngrok, also include the public ngrok URL in Auth0 allowed origins.

### Gmail

Configure Google Cloud OAuth redirect URI:

```text
http://localhost:3000/api/auth/gmail/callback
```

### Slack

For localhost-only development, Slack OAuth is limited because Slack expects a public callback URL.

For public local testing with ngrok:

1. run `npm run dev`
2. expose port 3000 via ngrok
3. set `APP_BASE_URL` to your ngrok HTTPS URL
4. configure the Slack app redirect URL to:
   - `https://<your-ngrok-domain>/api/auth/slack/callback`
5. restart the dev server after changing environment variables

Pollux uses `APP_BASE_URL` to keep callback redirection consistent in proxied local environments.

---

## Testing / Judge Quick Start

This repository is intended to be easy to review.

### Fastest evaluation path

1. Watch the demo video  
   https://youtu.be/YgdlLQ0dSTA

2. Open the live app  
   https://transnationally-jauntier-fritz.ngrok-free.dev

3. Sign in

4. Connect Gmail and/or Slack

5. Open the Inbox

6. Choose a real message

7. Click **Generate AI Reply**

8. Review the candidate drafts

9. Edit if desired

10. Send through the original provider

11. Open Dashboard to inspect the Daily Brief summary flow

12. Open Settings to inspect style personalization and connection state

### What judges should look for

- explicit sign-in and explicit provider connection
- user-visible control before sending
- real provider integrations
- backend / frontend coordination for trustworthy send behavior
- polished end-to-end UX rather than isolated API demos
- a product architecture that is aware of persistence, fallbacks, and local reliability issues

### Demo / test credentials

```text
Live app: https://transnationally-jauntier-fritz.ngrok-free.dev
Demo account: TBD
Test notes: TBD
```

---

## Repository Structure

```text
pollux/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── inbox/
│   │   ├── settings/
│   │   └── api/
│   │       ├── auth/
│   │       ├── inbox/
│   │       ├── reply/
│   │       ├── send/
│   │       ├── summary/
│   │       ├── style/
│   │       ├── events/
│   │       └── attachments/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── inbox/
│   │   ├── layout/
│   │   ├── reply/
│   │   ├── settings/
│   │   └── shared/
│   └── lib/
│       ├── adapters/
│       ├── auth0.ts
│       ├── config.ts
│       ├── gmail/
│       ├── slack/
│       ├── openai/
│       ├── style/
│       ├── services/
│       ├── types/
│       └── viewed-store.ts
├── .env.example
├── package.json
└── README.md
```

### Key directories

- `src/lib/adapters/` — provider-specific inbox and send adapters
- `src/lib/services/` — aggregation, send, reply, summary, risk, and event services
- `src/lib/gmail/` — Gmail OAuth, token, parsing, client, fetchers
- `src/lib/slack/` — Slack OAuth, token, client, fetchers
- `src/lib/style/` — style presets, extraction, storage
- `src/components/` — UI for dashboard, inbox, replies, settings, and shared primitives
- `src/app/api/` — route handlers for all product capabilities

---

## Current Limitations

Pollux is functional, but it is still an early product prototype.

Current limitations include:

- live deployment and demo credential setup may still require final packaging
- attachment download is scaffolded but not fully implemented
- inbox cursor pagination is not fully implemented yet
- viewed/opened state is still localStorage-based rather than database-backed
- risk classification is keyword-based rather than ML-based
- Daily Brief caching is lightweight and in-memory
- some local development flows still depend on careful OAuth configuration
- platform coverage is currently focused on Gmail and Slack

These limits are real, but they are also clearly bounded and visible in the current architecture.

---

## Future Work

- richer action extraction and prioritization
- audit-oriented action history views
- stronger provider coverage beyond Gmail and Slack
- attachment download and handling
- database-backed viewed state and user preferences
- more advanced risk classification
- more personalized communication modeling over time
- broader multi-platform communication automation inside explicit approval boundaries

---

## Why Pollux Is Different

Many AI messaging tools start from the model and add product later.

Pollux starts from the workflow:

- who is signed in
- what account is connected
- what message is being acted on
- what style the user wants
- what the AI is allowed to help with
- when the human must remain in control

That is the product idea at the center of Pollux.

---

## License

MIT
