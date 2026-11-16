---
title: The design session
description: What a design remembers - screens, revisions, variation groups, tweak controls and comments - keyed to a subject, with template mode, a template set and seeding from another session.
---

The model holds the decisions; the **session** holds the exploration. A session records how each screen came to be, what was offered and not taken, and what people said about it, so nothing is lost when a design is changed.

```ts
const session = foldDesignSession(events);        // @cratis/scene.design
```
```csharp
var session = DesignSessionReducer.FoldAll(events); // Cratis.Scene.Design
```

## Subject

A session is keyed to a generic subject, `{ kind, id }`, with `kind` one of `story`, `issue`, `application`, `designSystem` or `custom`. A session knows nothing about what a story or an issue is; the host names the subject, so one
host can use sessions for several subjects and different hosts can use the same session.

## What is recorded

| Record | Holds |
| --- | --- |
| **Screens** | The session's screens in order, each with its **current revision**. Only the current revision is written into the host's Screenplay. |
| **Revisions** | Per screen: the Screenplay **text**, the operations that made it, the prompt, the author, the turn id, the design-system version, the basis revision, and - for a revert - the revision it restores. Nothing is deleted: a revert is a new revision. A turn that touches several screens records one revision per screen with the same turn id. |
| **Variation groups** | Layouts of a screen asked for together: the candidates as Screenplay text and which was chosen. Choosing makes the candidate the screen's next revision; the others stay. |
| **Tweak controls** | Address (a profile key, `screen.element.prop`, or a token), kind (`hue` or `choice`), options and whether it was dismissed. |
| **Comments** | Screen, element id (a stable anchor), a fallback position when no element is under the pin, text, author, resolved. |

Revisions store text, not documents: converting between Screenplay text and a Scene document is the caller's, with `Cratis.Scene.Screenplay`.

## Template mode

`mode: 'templates'` makes a session about screen templates. Its revisions are template Screenplay text, and the output is destined for the design-system draft. Operations are the same; they name `template` instead of `screen`.

## Template set

`templateSet` is the set of templates the session may use. It is set when the session starts and may be changed (`DesignTemplateSetChanged`; an empty set lifts the constraint). [The catalogue and the operations](operations.md#template-set) enforce it.

## Seeding

`seedDesignSession` / `DesignSessions.Seed` returns the events that start a new session from another's screens: a story's design becoming the design of the issue filed from it. Each screen is copied
as the first revision of the new session and linked (`origin`) to the revision of the source it was copied from; the new session has the source's mode and template set and records `seededFrom`. Later changes to the source do not reach it.

## Folding is deterministic

Ids come with the events, so folding is a pure function and a client replaying events, a spec and a Chronicle reducer agree. An event that does not apply leaves the session as it is: an event before the session starts, a second start, a repeated id, a revert to a revision of another screen, a second choice from a variation group.
