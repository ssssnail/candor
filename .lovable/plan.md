## Goals

Three copy + layout tweaks across the submit flow.

---

### 1. Submit Feedback page (`/r/$linkId`) — make "The One Thing" the hero

Today the page reads top-to-bottom as: Strengths → Suggestions → One Thing. The chips dominate; the textarea (the actual signal) feels like an afterthought.

**Restructure to put The One Thing first and frame the chips as helpers:**

```text
[Eyebrow] Code Review
[H1]      Reviewing your teammate
[Lead]    One honest line beats ten polite ones.

┌─ The One Thing ────────────────────────── (violet, hero card)
│  If you were their co-founder,
│  what's the ONE thing you'd push them to fix?
│  [ large textarea, autofocus ]
└──────────────────────────────────────────

  Need a warm-up? Tap a few tags below — totally optional.

● Core Strengths            (optional · multi-select)
  [chips, slightly smaller / lower visual weight]

● Optimization Suggestions  (optional · multi-select)
  [chips]

[ Ship it 🚀 ]
```

Concrete changes:
- Move the violet "One Thing" card directly under the lead, above both chip sections.
- Add an autofocus to the textarea.
- Add a small bridge line above the chip groups: EN `Need a warm-up? Tap a few tags — totally optional.` / ZH `需要点灵感？下面的标签可选可不选。`
- Slightly reduce visual weight of the chip cards (smaller padding, no border-glow on hover) so the textarea reads as the main act.
- Keep submit logic and `buildRawText` order unchanged (output text still: strengths → suggestions → one thing).

---

### 2. Success page — replace "PR / inbox" with warmer wording

The PR/repo metaphor is fun on the landing page but feels cold on the "thanks, submitted" screen.

New copy (`t.submit.done*`):

| key | EN | ZH |
|---|---|---|
| doneEyebrow | Delivered | 已送达 |
| doneH1 | ✅ Your note just landed on their desk. | ✅ 你这句话，已经放到 TA 桌上了。 |
| doneSub | Sent word-for-word. No name attached — unless you signed it. | 原文送达。没人知道是你写的——除非你署了名。 |
| doneSee | What they'll read | TA 会看到 |

---

### 3. Install-plugin nudge — reframe around the user's own growth

Replace the current "Want to know how they merge it?" block with a value-first invitation. The user submitting feedback is also a potential repo owner.

New copy:

| key | EN | ZH |
|---|---|---|
| installH | Curious what people really think of you? | 想知道别人眼中真实的你？ |
| installP | Spin up your own repo and let honest feedback find you. Two clicks to a better you. | 创建你自己的 Repo，让真诚的反馈主动找上门——两次点击，遇见更好的自己。 |
| installCta | Spin up my repo → | 创建我的 Repo → |

The CTA links to `/inbox` (where "Spin up repo" already lives) instead of the generic `/`.

The `Backup: <thanksUrl>` line stays as-is (it's purely functional).

---

## Files to edit

- `src/lib/i18n.tsx` — update `submit.done*` and `submit.install*` strings (EN + ZH); add new `submit.warmup` bridge string.
- `src/routes/r.$linkId.tsx` — reorder sections (One Thing first, then strengths, then suggestions); add autofocus; tone down chip card styling; point install CTA `href` to `/inbox`.

No backend, schema, or business-logic changes.
