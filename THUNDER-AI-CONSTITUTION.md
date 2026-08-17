# THUNDER AI MAXIMUM-POWER CONSTITUTION
**Permanent · Sons of Thunder / Thunder Board**  
**Locked:** 2026-08-17 · “YOU HAVE THUNDER IN YOUR HAND”

## Product identity

Thunder is **not** a chatbot novelty inside the app.  
Thunder is the **fastest way to use the entire Sons of Thunder world**.

User-facing realization:

> I don’t have to figure out where anything is. I can just tell Thunder what I need.

Power line (locked copy):

**JUST ASK THUNDER. ⚡**  
Don’t hunt through the Board. Tell Thunder what you need.

## Orchestrator model

Internally route intent to one of:

| Mode | Meaning |
|------|---------|
| ANSWER | Authoritative fact or short counsel |
| FIND | Locate a brother / memory / feature |
| OPEN | Navigate to a screen |
| DO | Safe user-gated action (calendar, I’m In, install) |
| SEARCH | Selective external research only when needed |
| REMEMBER | Conversation continuity |
| CLARIFY | Ask one tight question |
| GET A BROTHER | Escalate to Text a Leader / human |

The brother never chooses modes. He speaks naturally.

## Truth hierarchy (hard)

1. **Current authoritative app data** (meeting engine, venue, The Code, announcements seed)
2. **Sons of Thunder approved knowledge** (DNA, identity, Mark 3:17 NASB)
3. **Member/profile data the user is authorized to see**
4. **Grok reasoning**
5. **External research only when the question depends on changing outside facts**
6. **Human brother / leader** when AI must not decide

Meeting date/time/venue have **one** live authority in app config + `getNextMeetingMonday`.  
Grok must not invent a different gathering.

## Authority boundary

- Thunder may **suggest** actions (chips).
- A **human** initiates consequential actions.
- AI is **never** authorization.
- Thunder must not: promote leaders, alter membership, broadcast push, change RLS/schema, expose private data, delete memories, deploy code, or bypass server auth.

## Capability map (this codebase)

| Capability | Status |
|------------|--------|
| Local authoritative router (meeting, Code, RSVP, crisis → leader) | **USED** |
| Grok via Netlify `thunder-ai` (key server-only) | **USED** |
| Conversation history (short window to Grok) | **USED** |
| Action chips (calendar, brothers, code, events, install, I’m In, text leader) | **USED** — expand carefully |
| App context (view, RSVP, first name, announcement headline) | **USED** (minimal) |
| Voice (tap-to-speak; optional in-app “Hey Thunder”) | **USED** — not system-wide always-listen |
| Web search on every question | **REJECT** |
| Web search selective | **DEFER** unless explicit need |
| Full tool-calling agent loop | **DEFER** — chips + local route first |
| Permanent behavioral profiling | **REJECT** |
| AI as counselor | **REJECT** |

## Empty state (locked UX)

- Title energy: **JUST ASK THUNDER**
- Sub: Don’t hunt through the Board. Tell Thunder what you need.
- 3–4 **real** example chips only (wired to real pipeline):
  - When’s the next gathering?
  - Show me the brothers.
  - Put it on my calendar. / Add gathering to calendar
  - Text a leader. (help path)

Show power through behavior, not “AI powered” marketing.

## Concierge reveal

Tour step already targets Thunder FAB with real demo question through real pipeline.  
Do not replace with a fake demo.

## Failure

- Grok down → local answers still work; clear short error; Text a Leader remains.
- Never white-screen the Board because AI failed.

## Security

- `XAI_API_KEY` only in Netlify env.
- No service_role / VAPID private / LEADER secrets as real server auth in client.
- Prompt injection cannot grant privileges.

## Routing efficiency

KNOWN LOCAL FACT → instant.  
SIMPLE BOARD QUESTION → fast Grok.  
APP ACTION → chip / allowlisted `runThunderAction`.  
HUMAN MATTER → escalate.

Maximum capability through **intelligent routing**, not maximum cost on every message.

## Permanent principles (bake)

1. Thunder is the intelligence layer of Thunder Board.  
2. Thunder is an orchestrator, not merely a chatbot.  
3. The brother tells Thunder what he needs.  
4. Authoritative app data outranks AI generation.  
5. Thunder may answer, find, open, act via safe user-authorized tools, clarify, or escalate.  
6. AI never becomes authorization.  
7. Thunder knows when a real brother is better.  
8. Outside research is selective.  
9. Conversation has continuity.  
10. Character state communicates AI state where useful.  
11. Failure degrades gracefully.  
12. The interface hides complexity; the user experiences power.

---

*This file outranks chat memory for Thunder AI product decisions. Read before changing `thunder-ai.js`, Thunder modal UX, or local router.*
