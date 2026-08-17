# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single working software engineer preparing for the GitHub Copilot certification exam, studying on a work laptop in deliberate focused sessions in the weeks before the exam. There is no second audience: no instructor view, no cohort, no sharing.

## Product Purpose

A local study app that turns the markdown content of the `github-copilot-certification-study-guide` repository into two usable study surfaces: a course reader for the 19 written lessons, and a practice quiz over 130 exam questions. Success is the user walking into the exam having read the material once and having driven their practice score above the pass threshold, with the app showing honestly which banks are still weak.

## Positioning

Every question in the bank carries an explanation, including the 50 questions in Test 1 that shipped with no explanations upstream and were written by hand for this app. The quiz is therefore a teaching surface, not just a scoring surface: a wrong answer always returns a reason.

## Operating Context

Run locally with `npm run dev`, or built with `npm run build` and served over http. Study happens in two shapes: long reading passes through the course, where the user ticks the checklist items embedded in the source markdown and marks lessons complete, and shorter timed quiz runs where the user answers with the keyboard (digits to pick, Enter to advance) and reviews the misses afterwards. Progress lives in `localStorage`, so the app must be honest that clearing browser data loses it.

## Capabilities and Constraints

- Course: 4 sections, 19 lessons, 118 minutes of reading, generated to HTML by `build_lessons.py` with per-lesson table of contents, syntax highlighting, task checkboxes, per-lesson completion, sidebar full-text search.
- Quiz: 4 selectable banks (50 / 30 / 25 / 25 = 130 questions), question count and time limit selectable, instant or exam-mode feedback, shuffling of questions and answers, keyboard answering, results with per-bank breakdown, full review, and retry-incorrect.
- Content is generated, not authored in the app: `build_questions.py` and `build_lessons.py` emit `src/data/*.js`. Design work must not edit generated data by hand.
- The lesson body is injected as pre-rendered HTML, so styling reaches it through CSS on the container rather than through components.
- Delivery is over http, so CDN fonts and remote assets are acceptable.
- Desktop and laptop widths are the only target. Narrow screens should not be actively broken, but they are not the design case.
- No accounts, no server, no network calls at runtime, no analytics.

## Brand Commitments

None. The app is unbranded and personal. The GitHub Copilot certification is the subject matter, not a licensor, and the app must not present itself as an official GitHub product.

## Evidence on Hand

- Real lesson content: `../github-copilot-certification-study-guide` (19 markdown files, cloned upstream).
- Real question banks: 130 parsed questions, every one with an explanation.
- Hand-written explanations: `explanations-test-1.json` (50 entries).
- No screenshots, logos, photography, testimonials, or licensed illustration exist. Nothing of that kind may be invented.

## Product Principles

1. The content is the product. Every design decision serves reading and recall, never decoration for its own sake.
2. Never score without teaching. A result screen that shows a number and no reason has failed.
3. Progress must be legible at a glance, because the user's real question between sessions is "what have I not done yet".
4. The keyboard is the primary input during a quiz run. Pointer use is a fallback.
5. Say only what is true. The app knows nothing about the real exam beyond the study guide it was built from.

## Accessibility & Inclusion

No user-specific requirement was established. Standard obligations still apply: readable body text at long reading lengths, visible keyboard focus (the quiz is keyboard-driven), and colour never as the sole carrier of correct/incorrect state.
