---
title: Session events
description: The Chronicle event types of a design session, the reducer that folds them, and what a host owns.
---

`Cratis.Scene.Design` declares the session's events as Chronicle `[EventType]` records and ships `DesignSessionReducer`, an `IReducerFor<DesignSession>`. The TypeScript package has the same events as a `DesignSessionEvent` union (with a `type` property) and `reduceDesignSession`.

**The host owns** the commands that append these events, who may issue them (authorization) and the event source - normally one per session id. Scene Design owns what the events mean.

## Event types

| Event | Meaning |
| --- | --- |
| `DesignSessionStarted` | A session began on a subject, in a mode, optionally with a template set and a session it is seeded from. |
| `DesignTemplateSetChanged` | The templates the session may use changed; empty lifts the constraint. |
| `ScreenRevisionRecorded` | A screen gained a revision; it is now the current one. |
| `ScreenReverted` | A screen went back to an earlier revision, as a new revision that restores it. |
| `ScreenRemovedFromDesign`, `ScreensReordered` | A screen was taken out (its revisions stay); the screens were reordered. |
| `VariationsProposed`, `VariationChosen` | Layouts were offered; one became the screen's next revision. |
| `TweaksProposed`, `TweakDismissed` | Controls were offered for a screen or the whole design; one was dismissed. |
| `CommentAdded`, `CommentPinned`, `CommentResolved`, `CommentReopened` | A comment was added (anchored to an element), pinned to a position, resolved or reopened. |

Chronicle events have no nullable properties, so an optional fact in C# is an empty string or list (an absent session id, turn id, prompt, element id or template set); the TypeScript union leaves it out. The folded session is the same.

## Folding

```csharp
var session = DesignSessionReducer.FoldAll(events);              // pure, in order
// or: register DesignSessionReducer with Chronicle; each On... method calls the same Fold.
```

`DesignSessionEvents.Parse(json)` reads an event by its `type` property for hosts that keep events as JSON.

## Revisions store text

`ScreenRevisionRecorded.Text` is Screenplay text. Hosts convert with `Cratis.Scene.Screenplay` before recording a revision and after reading one; Scene Design never parses it.
