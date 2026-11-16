---
title: The design canvas
description: The AI canvas of Scene Design as a React package - artboards and storylines, a chat bar with refusals, variations, tweaks, revision history, comment pins, direct manipulation, template mode and the screens overview - and the host seam contract it is mounted through.
---

`@cratis/scene.design.react` is the canvas of [Scene Design](index.md): the part a person uses. It draws a design's screens as **artboards**, takes requests in a **chat bar**, offers **layouts** to choose between and **tweaks** to try, keeps a **history** of every screen, takes **comments** on the screens and opens the [Scene editor](../editor/screen-editor.md) when something is quicker by hand.

It holds no logic of the design itself. Catalogue answers, operations, the screen set and the folded session all come from `@cratis/scene.design`; the canvas turns them into pictures and into session events. It also holds no application: persistence, the AI, the Screenplay compiler, the router and the signed-in user are lent to it through the [host seams](#the-host-seams).

```bash
yarn add @cratis/scene.design.react
```

## Mounting it

The canvas fills the box it is given and draws no page chrome - no title, no header, no routes - so a host drops it in as **one tab of a larger workspace**. It is mounted once per **subject** (a story, an issue, an application; whatever the host calls the thing being designed).

```tsx
import { DesignCanvas } from '@cratis/scene.design.react';
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';

export const ScreensTab = ({ host }: { host: DesignCanvasHost }) => (
    <div style={{ height: '100%' }}>
        <DesignCanvas host={host} />
    </div>
);
```

| Prop | Meaning |
| --- | --- |
| `host` | The [host seams](#the-host-seams). The only required prop. |
| `mode` | What a subject that has no design yet starts as: `screens` (the default) or `templates`. A session that exists keeps its own mode. |
| `templateSet` | The templates a design that has not started is limited to. |
| `initialScreen` | The screen to focus first. |
| `editorKit` | The words, layout labels, icons and palette of the Scene editor, when the host dresses it itself; Scene's defaults otherwise. |
| `className` | Added to the canvas' root. |

The first view of a subject with no design starts one: the canvas appends `DesignSessionStarted` through the host's session store.

## The host seams

Everything the canvas needs from the application is on one object, `DesignCanvasHost`. A seam that is absent is not offered: no `ai` means no chat to type into, no `storylines` means no storyline to add, no `designSystem` means a proposal is shown but cannot be sent.

| Seam | Contract | The host's job |
| --- | --- | --- |
| **Persistence** | `session: DesignSessionStore` | Keep the session's events on a stream of its own. `getEvents()` returns the events in order and the *same array* until they change; `subscribe` calls back when events were added - by this canvas, by another tab or by the server's design turn; `append` stores events and resolves once they are visible. |
| **Subject** | `subject: DesignSubject` | Say what the canvas is mounted for - `{ kind: 'story', id }`, `{ kind: 'issue', id }`, and so on. |
| **Screenplay** | `screenplay: ScreenplayBridge` | Turn the Screenplay *text* a revision stores into the Scene document the canvas draws, and back. In .NET that is `ScreenplayBridge` of `Cratis.Scene.Design.AI` (see [the Screenplay bridge](../architecture/screenplay-bridge.md#screenplay-text-and-a-scene-document)); reach it through an endpoint of your own server. |
| **AI transport** | `ai?: DesignTurnTransport` | Run a design turn on the host's server, which calls `Cratis.Scene.Design.AI`, and stream its progress. The server records the turn's revisions on the session itself; the canvas shows them as they arrive through the store. |
| **Catalogue** | `catalogue: DesignCatalogueSource` | Say what the screens are built from and drawn with: the runtime, the catalogue input (design system, shapes, queries, commands) and, optionally, the editor's environment and the UI profile with the way to change it. |
| **Design system** | `designSystem?: DesignSystemProposals` | Receive what the design system lacks - a token, a variant, a word, a component - and, from template mode, a designed template, into the design-system draft. |
| **Storylines** | `storylines?: StorylineStore` | Keep the storylines besides the default one, in the host's Screenplay document. |
| **User** | `user: DesignUser` | Name the person designing; every revision, comment and turn carries them. |
| **Routing** | `routing?: DesignRouting` | `screenFocused` is called as the designer moves between screens, so an address can follow; `openSubject` is where the [screens overview](#the-screens-overview) sends a click. |
| **Ids and words** | `ids?`, `strings?` | Make the ids of what is recorded (random by default) and override any of the canvas' words. |

### Persistence

```ts
interface DesignSessionStore {
    getEvents(): readonly DesignSessionEvent[];
    subscribe(listener: () => void): () => void;
    append(events: readonly DesignSessionEvent[]): Promise<void>;
}
```

The canvas never owns events and never keeps a copy: it folds `getEvents()` with `foldDesignSession`, so whatever the host's stream says is what the canvas shows. When the server's design turn appends revisions, they show up on the canvas the moment the host's `subscribe` calls back.

### The AI transport

```ts
interface DesignTurnTransport {
    runTurn(request: DesignTurnRequest, onProgress: (progress: DesignTurnProgress) => void, signal: AbortSignal): Promise<DesignTurnResult>;
}
```

A request carries the turn id (shared by every revision the turn records, so the whole turn can be undone), the session, the subject, the mode, the prompt, what the designer was looking at (the screen and the element), the **template set** the server's catalogue and checks must be restricted to, and the author.

While the turn runs, the transport reports `status` lines ("Placing the table"), the `reply` text and each `screen` it touched. The result carries the reply, the **refusals** and the **proposals**:

- A *refusal* is an operation the design did not accept: its reason and the nearest things that would be - each **alternative** is operations to apply or a proposal to the design system, and each shows in the chat as a button that does it.
- A *proposal* is something the design system lacks. The chat shows it with a *Propose to the design system* button; the designer decides.

Cancelling aborts the signal; the canvas stops waiting and marks the turn cancelled. A transport that throws fails the turn, which says so in the chat and records nothing.

### The Screenplay bridge

```ts
interface ScreenplayBridge {
    toDocument(texts: readonly { screen: string; text: string }[], mode: DesignMode): Promise<SceneDocument>;
    toText(document: SceneDocument, screen: string, mode: DesignMode): Promise<string>;
}
```

`toDocument` gets the current revision of every screen and returns one document in which they share an application - its layouts and templates - and each is a screen. In template mode the texts are screen templates and come back as the document's `screenTemplates`. `toText` goes the other way for one screen or template. The canvas calls them whenever the session changes and never interprets the text itself.

### The catalogue source

```ts
interface DesignCatalogueSource {
    runtime: ScreenEditorRuntime;
    input(): DesignCatalogueInput;
    editorEnvironment?: ScreenEditorEnvironment;
    profile?: { current: UiProfile; change(profile: UiProfile): Promise<void> };
}
```

`catalogueInputFromRuntime(runtime, extras)` builds the part of the input the packages already say - descriptors, the screen templates they ship and the profile - and takes the rest (design system, shapes, queries, commands, sample data) as `extras`. The canvas adds the session's template set to it before building a context.

## A minimal host

This host keeps the events in memory and runs a design turn on a server of its own. It is everything a host has to write.

```tsx
import { useMemo, useSyncExternalStore } from 'react';
import { DesignCanvas, catalogueInputFromRuntime, type DesignCanvasHost } from '@cratis/scene.design.react';
import { screenEditorRuntimeForProfile } from '@cratis/scene.editor';
import type { DesignSessionEvent } from '@cratis/scene.design';

function createHost(subject: { kind: 'story'; id: string }, user: { id: string; name: string }): DesignCanvasHost {
    const runtime = screenEditorRuntimeForProfile(undefined);
    let events: readonly DesignSessionEvent[] = [];
    const listeners = new Set<() => void>();

    return {
        subject,
        user,
        session: {
            getEvents: () => events,
            subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
            append: async added => {
                await fetch(`/api/design/${subject.id}/events`, { method: 'POST', body: JSON.stringify(added) });
                events = [...events, ...added];
                listeners.forEach(listener => listener());
            },
        },
        screenplay: {
            toDocument: async (texts, mode) => (await fetch('/api/screenplay/read', { method: 'POST', body: JSON.stringify({ texts, mode }) })).json(),
            toText: async (document, screen, mode) => (await fetch('/api/screenplay/write', { method: 'POST', body: JSON.stringify({ document, screen, mode }) })).text(),
        },
        ai: {
            runTurn: async (request, onProgress, signal) => {
                onProgress({ kind: 'status', message: 'Working on it' });
                const response = await fetch('/api/design/turn', { method: 'POST', body: JSON.stringify(request), signal });
                // A server that streams progress calls onProgress as each line arrives; this one answers once, with the DesignTurnResult.
                return response.json();
            },
        },
        catalogue: { runtime, input: () => catalogueInputFromRuntime(runtime) },
    };
}

export const ScreensTab = ({ story }: { story: string }) => {
    const host = useMemo(() => createHost({ kind: 'story', id: story }, { id: 'ada', name: 'Ada' }), [story]);
    return <DesignCanvas host={host} />;
};
```

In a real host `events` is read from, and kept in step with, the subject's stream: a server design turn appends its revisions there, and `subscribe` fires when they arrive.

The package ships the stand-ins its own stories use, under `@cratis/scene.design.react/testing`: `createFakeDesignHost` (an in-memory session, a JSON stand-in for the bridge and a scripted AI that performs its turns through the real design engine), `createInMemorySessionStore`, `jsonScreenplayBridge` and `scriptedDesignTurns`. A host can start from them before its server exists.

## What the canvas does

### Artboards and storylines

Every screen of the session is an **artboard**, drawn faithfully by Scene at a fixed width under the design's UI profile, laid out in a row along a **storyline**. The default storyline lists every screen in the session's order and follows it as screens are added, removed and reordered; the arrows above an artboard reorder it, and the arrows *between* artboards are solid where a screen really navigates to the next one and plain where the storyline only puts it next.

Storylines besides the default one are the author's - an alternative way through a flow, the declined-payment path. They are kept by the host's `storylines` seam, so they live in the Screenplay document and not in the session. A storyline lists screens by name; the storyline bar adds one, and takes the focused screen into or out of it. Zoom is local to the canvas.

### The chat bar

The designer asks in plain words; the host's server runs the turn. The bar shows each turn as it stands - *working* with the server's latest status, *done*, *refused* or *failed* - and what it touched, each screen a button that focuses it. Enter asks, Shift+Enter breaks the line, and a running turn can be cancelled.

A refused turn keeps the reason and **its alternatives as buttons**. Taking one applies its operations as the designer's own change - a revision recorded under the designer, with the alternative's label as its prompt - or sends its proposal to the design system. A turn that touched several screens can be undone as a whole from the chat or from the history.

### Variations

Asking for other layouts of a screen records a **variation group** of up to three candidates. They are drawn side by side under the screen they belong to, lettered, each with *Use this layout*. Choosing one makes it the screen's next revision and keeps the others in the history; nothing offered is lost by choosing.

### Tweaks

Tweak controls the AI offers - a hue slider for the accent, a choice of corners - stay with the screen until the designer dismisses them. Moving one is a **deterministic edit**: the operation is computed from the control's address (a profile key, an element's property, a design-system token), checked and applied by the design engine, and recorded as a revision of its own. No AI is asked, so a tweak can be tried and gone back from like any other change. A token tweak is the design system's to decide, so it becomes a proposal.

### History and revert

Every screen has a history, newest first: what the prompt asked or, failing that, what the operations did in words; who; and which other screens the same turn changed. Going back to a revision records a **new revision** that restores it - nothing is deleted, and a revert can itself be reverted. *Undo this turn* takes every screen the turn changed back to the revision it was made from, takes out a screen the turn created, and leaves alone any screen changed since - undoing a turn never undoes later work.

### Comment pins

*Add comment* turns the focused artboard into a place to drop a pin. A pin is anchored to **the element under it**, by the element's id; it sits on that element's corner and follows it as the screen changes. A pin dropped where no element is stays at the position it was put (and is drawn dashed). A comment whose element has gone and that was never pinned has no place on the screen, so the list still shows it. Comments can be resolved and reopened; the AI is told the open comments by element, so what is written next to an element is what it reads when it changes that element.

### Direct manipulation

*Edit* opens `@cratis/scene.editor` - its surface, structure tree, palette and inspector - over the stage, on the focused screen, or on the template being authored in template mode. The editor writes nothing itself: what it would save waits, and *Save as a revision* records one revision for every screen it changed. A screen the editor did not touch records nothing.

### Proposing to the design system

The canvas edits screens and never the design system. Whatever the design system lacks - from a refusal, from a turn's result or from a token tweak - becomes a proposal listed in the side panel, each with *Propose to the design system*, which hands it to the host's `designSystem.propose`. It then follows the design system's own review and activation.

## Template mode

A session started with `mode='templates'` designs the design system's **screen templates** instead of screens. The same canvas, with these differences:

- The artboards are **schematics** of a template: its slots where its arrangement puts them - flow rows, columns and grids, or a freeform arrangement's placements - each named and marked primary or optional, and under them the item outlets it offers. A slot the arrangement forgot is still shown, in a strip below, so it can be seen and fixed.
- *New screen* adds a template with a first slot. Arrangement and content are edited with the Scene editor, opened on the template.
- There are no storylines; the canvas has no screens to join.
- The **Templates** tab lists the templates and proposes each one to the design-system draft through `designSystem.proposeTemplate`, with the template's current revision as Screenplay text. A proposed template is marked until it changes again. Nothing goes into any screen set.

## The template set

A design may be limited to some of the design system's templates. The **Templates** tab of a screens design is the picker: it lists every screen template of the design system and lets the designer allow or take away each. The set is recorded as `DesignTemplateSetChanged`, and then **everything honours it**:

- the **new-screen form** offers only the allowed templates;
- the **editor's palette and template picker** offer only those - the editor is opened on a runtime narrowed to the set, keeping a template a screen is already built on so that screen still draws;
- the **AI's catalogue** lists only those, and the turn request carries the set so the server restricts its checks the same way; the design refuses anything outside it with alternatives taken from the set.

When every template is allowed the set is lifted, which is what an absent set means; the last allowed template cannot be taken away, because an empty set would mean no limit.

## The screens overview

`ScreensOverview` is the read-only counterpart for a **product-wide "Screens" tab**. The canvas knows one subject at a time; the overview lists the screens across subjects, which the host supplies.

```tsx
<ScreensOverview
    subjects={subjects}                      // OverviewSubject[]: { subject, title, screens: { name, document, caption? }[] }
    runtime={runtime}
    routing={{ openSubject: (subject, screen) => navigate(subject, screen) }}
/>
```

Each screen is a thumbnail drawn by Scene, with a link back to the subject it was designed in. It can be filtered by words (a subject whose title matches keeps all its screens; otherwise the words are matched against the title, the screen's name and its caption) and by the kind of subject. Without `routing.openSubject` the names are not links. It draws no editing controls.

## State logic

Everything the canvas decides lives in plain functions beside the components, specified without a DOM, and exported so a host can reuse them: `recordDesignOperations` (applied operations to session events), `recordDocumentEdit`, `historyOf` and `revertTurnEvents`, `activeTweaks` and `tweakOperations`, `placePins` and `anchorPin`, `screenSetOf` and `reorderEvents`, `templateChoices` and `toggleTemplate`, `templateSchematic`, `chatReducer`, `filterOverview`.

## Styling

The canvas draws with the `--cratis-*` custom properties a host already has for Cratis Components, with fallbacks, so it needs the same layers as the Scene editor: `@cratis/components/tokens`, `styles` and `theme`. Its own stylesheets ship beside the modules that import them.

## Verify

```bash
yarn build && yarn test && yarn lint
yarn workspace @cratis/scene.design.react dev    # Storybook with the fake host
yarn workspace @cratis/scene.design.react test:browser   # every story, driven in Chromium
```

`test:browser` mounts each story of the canvas in a real Chromium and checks it draws what it is meant to show without a console error, a request that fails or a
placeholder for a component the profile cannot resolve, then drives the canvas the way a designer does: choosing a layout, moving a tweak and going back, commenting and
resolving, asking the chat (running, cancelling, refusing, failing), adding a screen, arranging the storylines and opening the editor on a screen. The design system editor's
stories have the same lane in `@cratis/scene.editor`. Both run in the browser-specification shards of CI.
