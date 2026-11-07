# 06 — Using AI Chat as a Homework Helper (Without Feeding It Your Real Data)

AI chat is a fine study partner for insurance homework — IF you follow one
boundary with total seriousness:

> **Never feed AI chat your real personal data.** No full legal name, no home
> address, no driver's license number, no SSN, no real policy numbers, no real
> VIN + address pair.

This is not "AI is dangerous." It is "your data is yours, and a chat log is a
third-party record you don't control." Treat chat logs like you'd treat a form
you photocopy and never shred. You would not tape your license to the back of a
library request slip; don't do the chat version of it.

Everything AI chat is actually *good* for in shopping for insurance requires
**zero** real data. Here's the honest map.

## What AI chat is genuinely great at (safe uses)

1. **Translating jargon.** Paste a generic coverage term or a *redacted* line
   and ask "explain this like I'm new." Swap "Allstate" for "Carrier A," swap
   real limits if you want, keep the structure.
2. **Making your coverage versions.** "Give me three sensible liability limit
   bundles for a single driver, an older sedan, excellent driving record, in a
   state with a $25/50/25 minimum." No name needed.
3. **Building your question list.** "Write 10 short questions to ask an insurance
   agent, including three that might catch a bait-and-switch."
4. **Rehearsing the phone call.** Role-play: "You're an insurance agent, act
   a little bit pushy, I'm practicing staying calm and polite." Practice beats
   dread.
5. **Writing comparison spreadsheets.** "Give me the column headers I need for
   comparing three insurance quotes fairly" — which is exactly what the
   worksheet in `site/worksheet.html` formalizes.
6. **Explaining state insurance basics.** "What questions does the [State]
   insurance department's consumer guide answer?" Then go *read the actual
   state site* — AI summarizes, the state site is the source of truth.
7. **Simplifying your dec page (redacted).** Copy the coverage rows only, not
   the name/address/policy number block. Or retype: "Comprehensive $500 ded,
   $95/6mo" style lines.

## What AI chat is bad at (because nobody can fix it at your end)

- **Real-time pricing for your actual situation.** It'll invent plausible-sounding
  rates. Never trust a number an AI chat gives you as a quote.
- **Current state minimums.** These change; AI models can be stale. Check
  your state's insurance department site.
- **Whether a specific discount exists at a specific carrier** — carrier
  discount lists change; verify by asking the carrier.
- **Filing claims or changing policies.** AI can help you *plan* the call; the
  carrier does the action.
- **Legal or regulatory interpretation for your actual dispute.** For real
  disputes, see the companion `insurance-appeals-calm-guide` and your state DOI.

## The placeholder playbook (memorize this one table)

Replace with pattern data, keep the *shape*:

| Real thing | Placeholder in chat |
| --- | --- |
| Name | "Driver A" |
| Address | "Mid-size city, ZIP starting 4XX" |
| Birthdate | Age band: "35–44" |
| Car | "2017 sedan, mid-trim" (VIN never) |
| Annual miles | "About 9k/year" (rounding is fine) |
| License number | Never. Not even "almost right." |
| SSN | Never. |
| Policy numbers | "Policy #001" style |
| Premiums & limits | Fine — numbers alone don't identify you |

The reason a VIN matters: a VIN + ZIP can identify a specific vehicle. Names +
addresses are identity. Numbers about coverage shape don't identify anyone.

## Useful prompts (copy-block)

```
Explain the difference between comprehensive and collision coverage using a
single story with one car and two different bad days.

I have quotes A, B, C with coverage matrices below. What differences in the
fine print should I look for before I trust premium comparisons?
[three redacted coverage blocks — no names/addresses]

Role-play: I'm calling to ask about a quote. Act like a mildly pushy agent
offering a lowball liability version. I'll practice asking for the version I
actually want; give feedback after.

Rewrite this list of coverage questions so a teenager could understand them.
```

## Which AI to use, and the privacy habits that carry over

- Any mainstream chat product is fine for the safe uses above. The concern is
  never "which brand" — it's "what did I just paste."
- **Habit 1:** paste, then *look at what you pasted* once before sending. Five
  seconds.
- **Habit 2:** use a placeholder workbook: keep a small file of "Driver A /
  Sedan B / City C" facts to copy from.
- **Habit 3:** log out of AI chats that sync with other devices if you're using
  a shared computer.
- **Habit 4:** never give AI chat your email "to save the conversation." Use
  screenshots or a notes file locally.
- **Habit 5:** if a chat asks for your SSN or driver's license to "help quote,"
  that is not a homework helper anymore — that's a quote funnel. Stop.

## Where the real numbers come from

The actual quote workflow (chapter 04) happens at:

1. Carrier websites and agent calls (with **soft-check** quotes where offered),
2. Licensed independent agents,
3. Your state insurance department's consumer resources.

AI chat's job is the thinking, the vocabulary, the rehearsal, and the
organization — all private, all pre-work, all yours.
