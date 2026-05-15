# twRty — Marketing Session Playbook

> **How to use this:** At the start of any new Claude Code terminal session, say:
> `Read /Users/meruj/Documents/twrty-blog-bot/twrty-blog-bot/twrty-website/MARKETING_PLAYBOOK.md and execute today's marketing actions.`
> Claude will read this document, run the standing procedure, and post + prep outreach for today.

---

## 1. Business context (what twRty is)

- **twRty Software Services** — custom websites, web apps, mobile apps
- **Domain:** twrty.org
- **Target market:** European SMBs (5–50 employees) needing a website or app
- **Current state:** ~7 LinkedIn followers, 0 leads, 0 paying clients via inbound
- **90-day goal:** 5–10 qualified discovery calls, 1–2 small projects signed
- **Budget:** ZERO. No paid ads, no paid tools, no premium tiers. Use only free features.
- **Honest constraint:** Personal LinkedIn handle is "Twrty Associate" (shell account, no real founder face). Lower reach than a real-founder personal brand. We work with what we have.

---

## 2. Goal of every session — two parallel tracks

### Path 1 — Daily content (Claude executes via browser)
- 1 post per day, rotating platforms
- Claude drafts + publishes via Claude in Chrome MCP

### Path 3 — Manual LinkedIn outreach (User executes 15 min/day)
- 10 personalised connection requests/day
- Claude prepares the daily ICP list + personalisation hooks
- User clicks "send" on each

---

## 3. Tools available

- **Claude in Chrome MCP** — controls the "twRty Marketing" Chrome browser
- **File system access** — `/Users/meruj/Documents/twrty-blog-bot/twrty-blog-bot/twrty-website`
- **Marketing browser pinned tabs** (all logged in):
  - LinkedIn (personal: "Twrty Associate" → manages company page **twRty Software Services**)
  - X / Twitter
  - Facebook business page
  - Instagram
  - YouTube channel
- **OG card asset:** `images/og-default.png` (1200×630 dark with brand wordmark — use as Instagram/social image when needed)
- **Logo file:** `images/logo-hires.png` (transparent bg, brand wordmark)

---

## 4. Standing Operating Procedure (run this every session)

When user pastes this doc or says "execute today's actions":

1. Run `list_connected_browsers` → confirm "twRty Marketing" / "Browser 1" is connected
2. Read **Section 12 — Tracking** below to see last post date and platform
3. Determine today's platform from rotation (Section 6)
4. Check today's date — if a post on that platform happened in the last 24h, skip to next platform in rotation
5. Generate ONE post for today's platform using brand voice (Section 8)
6. Draft post in chat (user sees the "twice check")
7. Navigate to the platform → click "Start a post" → type → screenshot
8. Verify on screenshot: correct account, correct text, correct formatting
9. Click Post → screenshot success confirmation
10. Update **Section 12 — Tracking** with today's entry (use the Edit tool on this file)
11. Generate today's 10 ICP profiles + personalisation snippets (Path 3)
12. Output the ICP list in chat for user to act on (15 min/day, user-only action)

---

## 5. Domain permissions checklist

Before posting on any platform, the Claude in Chrome extension needs domain permission. Easiest fix once: in marketing Chrome → click Claude extension icon → Site access → **"On all sites"**. Domains needed:

- linkedin.com ✅ (already done)
- x.com / twitter.com
- facebook.com / business.facebook.com
- instagram.com
- youtube.com

If a navigation fails with `permission_required` → tell user to allow that domain, then retry.

---

## 6. Posting rotation (Path 1)

| Day of week | Platform | Notes |
|---|---|---|
| Mon | LinkedIn (company page) | Highest B2B reach |
| Tue | X / Twitter | Short hot-take format |
| Wed | LinkedIn (different angle) | Case study or tactical advice |
| Thu | Facebook business page | Conversational, longer |
| Fri | Instagram | Image required (use og-default.png or screenshot from twrty.org) |
| Sat | X / Twitter | Lighter, dev-culture |
| Sun | Rest day | Plan next week |

**Hard rule:** Never post 2 same-platform posts in same 24 hours. Use Section 12 to verify.

---

## 7. ICP — target audience (use for ALL content + outreach)

### Geography (priority)
1. UK (English-native, dense LinkedIn)
2. Netherlands (high English fluency)
3. Germany (largest economy)
4. Ireland (English, EU)
5. Spain / Italy / France (only if local language available)
6. Nordic (Sweden, Denmark, Finland)

### Company size
- **5–50 employees** (sweet spot)
- Avoid <5 (no budget) and >100 (has internal IT)

### Industry priority
1. Local services with weak digital → dentists, clinics, law firms, accountants
2. D2C / niche e-commerce → small Shopify brands
3. Hospitality → boutique hotels, restaurants, holiday rentals
4. B2B SaaS startups → seed/pre-seed, need MVP
5. Construction / trades → small UK construction firms

### Job titles to target
- Founder / Co-founder / Owner
- CEO / Managing Director
- Marketing Director / Operations Director
- **Avoid:** IT Manager (gatekeeps), Procurement (too late)

---

## 8. Brand voice & content rules

### Voice
- Helpful, direct, anti-hype
- Tactical (specific numbers, real questions, exact thresholds)
- European framing (use €, mention UK/NL/DE)
- Soft CTA always — never hard sell

### Length per platform
- **LinkedIn:** 180–300 words. First 3 lines = hook (visible before "see more")
- **X:** <280 chars OR thread (split posts)
- **Facebook:** 100–180 words, conversational
- **Instagram:** caption 80–120 chars + 5 niche hashtags
- **YouTube community:** 50–100 words

### Do
- Lead with a problem the reader has
- Give specific, useful insight
- End with a low-friction CTA ("DM 'audit' for free 10-min review")
- Mention Europe / SMB context

### Don't
- Don't use generic "we are great" pitches
- Don't make up case studies / numbers
- Don't post hashtag-heavy LinkedIn (algo-penalised in 2026)
- Don't post 2+ posts/day on same platform
- Don't paste links to external sites in X (algo-penalised) — use replies for links

---

## 9. Content theme bank (50+ post ideas)

Rotate through these themes. Pick one theme + adapt to platform format.

### Educational / "5 questions" / tactical
- 5 questions before paying for a website ✅ used 2026-05-10
- 5 things every small business website MUST have in 2026
- 3 ways to test if your site is fast enough (PageSpeed thresholds)
- Why "cheap and fast" website costs more in 2 years
- Source code ownership: the clause every contract needs

### Industry-specific (rotate target ICP)
- Why most dental practice websites lose patients in <30 sec
- E-commerce: 5 reasons your Shopify store has a bad conversion rate
- Hospitality: how a slow booking page kills 40% of reservations
- Law firms: GDPR compliance basics for client portals
- Restaurants: do you really need an app? (honest answer)

### Tech opinion / dev culture
- Native vs cross-platform mobile in 2026: when each wins
- Custom backend vs Supabase/Firebase: when to choose what
- Why most SMBs don't need a CMS — and which 4 do
- Hidden cost of "free" website builders (Wix, Squarespace lock-in)

### Anti-pattern / warning posts
- 3 red flags when picking a development partner
- Why "we'll build everything ourselves" usually fails
- Sites that load in 8s — and what they're losing
- The €3,000 website that costs €30,000 in lost customers

### Process / behind-the-scenes
- Our 5-step audit before quoting a project
- How we estimate a website project (no BS)
- Why we send a Loom video before every contract

---

## 10. LinkedIn outreach playbook (Path 3 — user executes daily)

### Daily routine (15 min on Mac)
1. Search LinkedIn (5 min) → save 10 ICP profiles
2. Send 10 personalised connection requests using **Template A** (5 min)
3. Reply to anyone who accepted yesterday with **Template B** (5 min)

### Search formula (LinkedIn search bar)
```
"founder" OR "managing director" OR "owner"
Filters: Location = UK | Company size = 11-50 | Connection = 2nd or 3rd
Industry = (rotate per day): Hospitality / Legal / Health / Retail / Tech
```

### Template A — Initial connection request (max 300 chars)
```
Hi [First name], building twRty — we make websites and apps for
European SMBs. Saw [SPECIFIC THING about their company/post]. Would
love to connect with other folks scaling [their industry] in
[their country]. No pitch, just learning who's doing what.
```
**Mandatory personalisation per profile:** `[First name]`, `[SPECIFIC THING]` (recent post / company milestone / shared connection / city).

### Template B — After they accept (send 1 day later)
```
Thanks for connecting [Name]! Quick one: I noticed [SPECIFIC about
their digital presence — old website, no app, slow site]. Happy to
spend 10 mins giving you honest feedback if useful — no pitch, no
follow-up if not relevant. Either way, glad to be connected.
```

### Targets per week
- 50 connection requests sent
- 12–18 accepts (25–35% rate)
- 6–10 Template B follow-ups
- 3–5 conversations
- 0–2 discovery calls booked

### Red lines (never do)
- ❌ Send same template to everyone (no personalisation)
- ❌ More than 20 requests/day from one account (LinkedIn flags as spam)
- ❌ Pitch directly in connection request
- ❌ Use scrapers / automation tools (account ban)
- ❌ Buy Sales Navigator before validating playbook works

---

## 11. Operating rules for Claude (every session)

1. **Always read this entire doc at session start.** Do not skip Section 12 — it tells you what was already posted.
2. **Twice-check before publishing:** show draft in chat (1st check), screenshot the populated post box (2nd check), THEN click Post.
3. **Pacing:** max 1 post per platform per 24h. Verify Section 12 before posting.
4. **No paid upgrades:** if any platform shows a "Premium / Boost / Promote" upsell, decline it. Zero budget.
5. **Honest reach reality:** at <50 followers, every post reaches 10–50 people. Posts are brand seed, NOT lead gen. Real leads come from Path 3.
6. **Update Section 12 after every action** using the Edit tool. Without this, the next session won't know what was done.
7. **No fabricated case studies / data.** Every claim must be either generic-tactical (Core Web Vitals threshold) or sourced from twrty.org content.
8. **If domain blocked:** tell user one-line — "allow X domain in extension" — don't lecture.
9. **Stop and ask** if: account looks logged out, posting fails 2x in a row, content shows mention of a real client we can't verify, or any unexpected dialog.

---

## 12. Tracking — UPDATE AFTER EVERY ACTION

### Posts published

| Date (YYYY-MM-DD) | Platform | Topic / hook | Status | Notes |
|---|---|---|---|---|
| 2026-05-10 | LinkedIn (company page) | 5 questions to ask BEFORE paying anyone to build your business website | ✅ Live | 7 followers, ~0 reach baseline |

### Outreach progress

| Week starting | Requests sent | Accepted | Template B sent | Replies | Calls booked |
|---|---|---|---|---|---|
| 2026-05-10 | 0 | 0 | 0 | 0 | 0 |

### Lessons / iteration notes

- 2026-05-10: First session. Site SEO foundations + OG card complete. First LinkedIn post live. Outreach not started yet.
- 2026-05-10: User decision — Path 1 (Claude posts daily from CLI) + Path 3 (user does manual outreach 15 min/day). User runs Claude Code in terminal, pastes this doc to bootstrap each session.
- 2026-05-10: iPhone-to-Mac browser remote-control via Claude apps NOT supported. All marketing ops happen from Mac terminal Claude Code session.
- Next session priority: post on **X / Twitter** (LinkedIn already done today). Then start daily ICP delivery for outreach.

---

## 13. Site assets (already shipped — do NOT redo)

- ✅ All 13 pages have proper SEO meta tags (title, description, og:*, twitter:*, schema with `alternateName`)
- ✅ OG card live at `images/og-default.png` (1200×630, dark brand)
- ✅ Schema.org Organization with `alternateName: ["twRty","twrty","Twrty","Twrty Software"]`
- ✅ `images/logo-hires.png` available for use

---

## 14. Honest expectations (so we don't lose hope)

- **Month 1:** 30 posts published, ~2,000 total impressions across all platforms, 50 LinkedIn connections made, 0–2 calls
- **Month 2:** Compounding starts. ~5,000 impressions, 150 connections, 3–5 calls
- **Month 3:** First paying small client likely. ~10,000 impressions, 250 connections, 8–12 calls

If by end of Month 1 we have 0 conversations from outreach → ICP or template is wrong. Iterate.
If by end of Month 3 we have 0 paying clients → channel/positioning is wrong. Reassess.

---

## 15. End-of-session checklist (Claude must run before ending)

- [ ] Today's post published
- [ ] Section 12 updated with today's entry
- [ ] Today's 10 ICP profiles delivered to user (in chat)
- [ ] No upsells accepted
- [ ] User has clear next action ("send 10 connection requests using Template A")

---

*This document is the single source of truth for marketing operations. Edit it directly when plans change.*
