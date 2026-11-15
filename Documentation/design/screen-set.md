---
title: Screen sets and storylines
description: Several screens, the navigation between them and the storylines through them; the default storyline keeps the screen order.
---

A design is rarely one screen. A **screen set** is the ordered list of the design's screens plus **storylines** - ordered paths through some of them, the way a user goes through a story.

| | |
| --- | --- |
| `createScreenSet` / `ScreenSet.Create` | A set of screens, with its default storyline |
| `addScreenToSet`, `removeScreenFromSet`, `moveScreenInSet` | Add (at a position), remove, reorder |
| `withStoryline` | Add or replace a storyline of the author's |
| `findScreenLinks`, `findDanglingLinks`, `findUnreachedScreens` | Where screens navigate to each other (an element's destination property), the links to screens that are gone, and the screens nothing leads to |

The **default storyline** (`Default`) is kept by Scene Design: it always lists every screen, in screen order, as screens are added, removed and reordered. A host that wants a path through a story keeps its own storyline; a removed
screen leaves every storyline; steps that name no screen of the set are dropped; the default storyline is not the author's to replace.

Navigation is ordinary Scene: a `link` operation sets a destination property (`{ screen }`) on the element. Links are found by reading the document, so the set is never out of step with it.
