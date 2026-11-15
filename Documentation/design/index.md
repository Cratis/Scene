---
title: Scene Design
description: How an AI or a canvas designs screens and screen templates in Scene without inventing anything - a catalogue it is grounded in, operations that are checked and lowered to Scene edits, a screen set, and a session that remembers.
---

Scene Design is what sits between a designer (a person on a canvas, or a model with tools) and the Scene document. It exists so that what is designed
is always *made of what the design system and the packages offer*, and so that how a design came to be is never lost.

It ships twice with the same meaning: `@cratis/scene.design` (TypeScript) and `Cratis.Scene.Design` (C#). Both run the shared
`scene-design-fixtures.json` corpus, so a catalogue answer, an operation outcome, a screen set and a folded session are the same in either.

| Piece | What it does | Page |
| --- | --- | --- |
| **Catalogue** | Deterministic grounding built from the design system, themes, profile packages, templates and what the host supplies. Queryable. | [The design catalogue](catalogue.md) |
| **Operations** | `addScreen`, `insert`, `set`, `remove`, `move`, `link`, `profile`, `variations`, `tweaks`, `refuse` and the template-mode set. Checked against the catalogue, lowered to Scene edits, applied through the engine. | [Design operations](operations.md) |
| **Screen set** | Several screens, the navigation between them and storylines; the default storyline follows the screen order. | [Screen sets and storylines](screen-set.md) |
| **Session** | Screens, their revisions, variation groups, tweak controls and comments, keyed to a subject; Chronicle events and a reducer. | [The design session](session.md), [Session events](events.md) |
| **Canvas** | `@cratis/scene.design.react`: artboards along storylines, a chat bar, layouts, tweaks, history, comment pins, direct manipulation, template mode and a screens overview, mounted through host seams. | [The design canvas](canvas.md) |

## What it does not do

- It does not read or write Screenplay. A revision stores Screenplay *text*; a caller converts text to a Scene document and back with `Cratis.Scene.Screenplay`. Everything here is expressed in text and Scene documents.
- It does not own commands, authorization or event streams. A host appends the session's events to a stream it owns and runs the reducer over them.
- It does not call a model. The AI layer (`Scene.Design.AI`) calls the catalogue's read tools and the operations; this package is what makes their answers deterministic.

## Two modes

A session designs **screens** (written into the host's Screenplay) or, in **template mode**, **screen templates** - slots, outlets, arrangement, content - whose
Screenplay text is destined for a design-system draft. The same operations serve both; an operation names a `screen` or a `template`.

A session may carry a **template set**: the templates it is allowed to use. The catalogue then lists only those, and `addScreen` or any template change outside the set is refused with
alternatives taken from the set.

## Verify

```bash
yarn build && yarn test && yarn lint
dotnet build && dotnet test
```

`generate-design-fixtures.mjs` regenerates the corpus from the TypeScript package, which is the reference.
