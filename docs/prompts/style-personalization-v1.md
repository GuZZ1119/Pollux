# Pollux Style Personalization V1

## Goal

Build a hackathon-friendly style personalization system for Pollux that works even when the user has no usable Gmail sent history.

The system should improve reply quality without model fine-tuning, LoRA, vector databases, or major architectural changes.

## Core Product Decision

Style personalization must support **three user-selected onboarding paths**:

1. **Learn from Gmail Sent**
2. **Upload or paste writing samples manually**
3. **Start from a preset style**

This ensures the feature is usable for:
- users with rich Gmail history
- users with little or no sent history
- users who want direct control over their style setup

## Why This Approach

This is the fastest way to create visible personalization in a hackathon setting because it:
- reuses the existing reply generation flow
- does not require training infrastructure
- creates obvious demo value
- avoids the feature failing for cold-start users

## User Flows

### Path A — Learn from Gmail Sent
Use recent Gmail `SENT` emails to build:
- one structured `StyleCard`
- a set of representative `StyleExample` records

### Path B — Upload or Paste Writing Samples
Allow the user to provide writing material manually through:
- textarea paste
- `.txt`
- `.md`
- optional `.docx`

The uploaded or pasted content should be converted into:
- one structured `StyleCard`
- a small set of `StyleExample` records
- optional guardrails / banned phrases

### Path C — Start from a Preset
If the user has no usable samples and does not upload anything, allow them to choose a preset such as:
- Professional
- Friendly
- Concise
- Assertive

The preset becomes the initial `StyleCard`, and future sent replies can gradually create real `StyleExample` data.

## Cold Start Fallback Logic

### 0 examples
Use preset-based generation only.

### 1–3 examples
Do lightweight extraction only:
- common opening style
- common signoff
- average sentence length
- directness level

Do not use retrieval yet.

### 4–9 examples
Use simple few-shot prompting with 1–2 relevant examples.

### 10+ examples
Use heuristic retrieval and inject the top 3 examples into reply generation.

## Style Personalization Output

The internal personalization package should contain:

### StyleCard
Structured fields such as:
- tone
- directness
- sentence length
- emoji preference
- preferred greeting
- preferred signoff
- banned phrases
- common hedge words

### StyleExample
Representative writing examples with lightweight tags:
- provider
- intent
- tone
- length bucket
- recipient relation
- quality score

### Guardrails
Optional user-level boundaries such as:
- avoid being too casual
- avoid overpromising
- do not use certain phrases
- do not include emoji
- keep replies concise

## Retrieval Strategy

Do **not** use vector search in V1.

Use heuristic scoring only, such as:
- provider match
- intent match
- recipient relation match
- length similarity
- recency
- quality score

Select the top 3 examples for prompt injection.

## Prompt Integration

Reply generation should use:
1. current `StyleCard`
2. top retrieved `StyleExample` records
3. current incoming message
4. runtime context such as provider and recipient relation

The goal is to make the generated reply feel noticeably more personalized than the current static mock style card approach.

## Manual User Choice Requirement

The user must explicitly see and choose one of the following setup methods:

- Learn from Gmail Sent
- Upload writing samples
- Paste examples manually
- Start from a preset

This choice must be visible in the UI and must not be hidden behind an automatic-only flow.

## Minimal UI Scope

Add a new Settings section:

## Build Your Style

It should include:
- a button for Gmail-based style learning
- a paste box for manual writing samples
- a file upload entry for `.txt`, `.md`, and optional `.docx`
- a preset picker
- a small preview of the learned style:
  - tone
  - sentence style
  - preferred signoff
  - 3 representative examples

## Feedback Loop

After the user edits and sends a reply, store:
- generated candidate
- final sent version
- whether it was heavily edited

This data can later become new `StyleExample` records.

## Non-Goals for V1

Do not implement:
- LoRA / fine-tuning
- vector databases
- background jobs
- multi-platform expansion
- complex NLP pipelines
- full document ingestion platform behavior

## Success Criteria

The feature is successful if:
- users can personalize style even with no Gmail sent history
- users can manually upload or paste their own writing
- reply generation changes noticeably based on style data
- the app remains stable and demoable
- `next build` passes