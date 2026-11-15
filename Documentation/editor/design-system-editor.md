---
title: The design system editor
description: Browse and edit a design system - foundations, themes, components, words and the Screenplay it is held in - on a draft, and hand every effect to the host through the DesignSystemHost seam.
---

`DesignSystemEditor` shows a product's design system and edits it by hand. It works on Scene's resolved design system
(`DesignSystem` of `@cratis/scene.model`: token roles, components with their parts, variants and states, themes with a value
for every token in every mode, words, contrast rules) and on nothing else. It has no router, no Arc client, no persistence and
no authorization. What a product does with a design system - where its versions live, who may activate one - belongs to the
host and reaches the editor through [`DesignSystemHost`](#the-host-seam).

```tsx
import { DesignSystemEditor } from '@cratis/scene.editor';
// or, to keep the rest of the editor out of the bundle:
import { DesignSystemEditor } from '@cratis/scene.editor/DesignSystem';

<DesignSystemEditor host={host} subject='Acme' />
```

## What it shows

| Section | What it holds |
|---|---|
| Overview | How much there is of each kind, the palette, the components drawn from their tokens, the layouts and templates, the Screenplay source (read-only), and how many values the designs have outside the design system |
| Color, Type, Spacing & radius, Elevation & motion | The tokens of each foundation, each drawn as what it is (a swatch, a sample of type, a distance, a shadow), in the theme and mode chosen |
| Themes | The themes that implement the design system; which is the default; which are hard to read |
| Components | Every variant in every state and mode of the theme shown, with the contrast of its text on its background; where the Screenplay names the component |
| UI profile, layouts & templates | What the version's Screenplay declares besides the design system, and its text for download |
| Voice & naming | The words the product speaks with |
| Off the standard | What the designs have outside the design system (when the host can find it) |
| Changes in draft | While a draft is open: what differs from the active version, conflicts to decide, a preview on screens, and the way forward - submit for review, activate, discard |

The banner at the top says which version is the standard, whether a draft is open, and holds the switches for the version, theme
and mode shown. The contrast the editor reports is the design system's `contrastFindings` when it carries them, and otherwise
what `measureDesignContrast` of `@cratis/scene.engine` measures from its `contrastRules`; the values of a theme and mode are the
ones it carries, with its components resolved by `evaluateDesignComponents` when it carries no resolution.

## Editing a draft

Only a draft can be changed. On a draft the editor changes a value in place (saved when the field is left), adds a token with
what it is for and a value, picks the token a component part takes in a state, sets a word, and adds (as a copy), removes or
makes default a theme. Each edit becomes one or more `DesignChange`s - an address and a value - and is handed to the host in one
call:

```ts
changeDraft(version, expectedRevision, [{ path: 'dark.color.primary', value: '#ff0000' }]);
```

The addresses are built by the helpers of `Resolving/designEdits` and are the vocabulary of the host's draft command:

| Helper | Address | Value |
|---|---|---|
| `roleChange(category, name, description)` | `tokens.<category>.<name>` | what the token is for; empty removes the token |
| `valueChange(theme, isDefault, category, name, mode, value)` | `<mode>.<category>.<name>` for the default theme (`values.` when the value is for every mode), `theme.<theme>.<mode or values>.<category>.<name>` for another | the value; empty takes it away |
| `partChange(component, variant, state, part, token)` | `components.<component>.variants.<variant>[.states.<state>].<part>` | the token's address; empty clears the part |
| `wordChange(kind, key, text)` | `words.<voice or naming>.<key>` | the text; empty removes it |
| `addThemeChange(name, copyOf)` | `themes.<name>` | the theme it is copied from |
| `removeThemeChange(name)` | `themes.<name>` | empty |
| `defaultThemeChange(name)` | `default-theme` | the theme's name |

The editor never edits the Screenplay text. The host makes each change in the draft's text and resolves it again; the editor
reads the new state back with `load`. Every change carries the revision of the draft the person edited, so the host can refuse
a change made against text that has moved on - the editor says why and keeps what was typed.

## The host seam

`DesignSystemHost` is everything the editor asks of the application that embeds it. A member the host leaves out is not
offered: the editor hides the control or says why it is unavailable, and never does the thing silently. Every action answers
with a `DesignSystemRefusal` - `undefined` when it was done, or the reason it was not. The editor shows the reason where the
person acted and stays where it is.

| Member | Meaning |
|---|---|
| `person` | Who is looking. Someone who wrote part of a draft may not activate it; the editor disables the button for them and the host should refuse them too |
| `load()` | Reads the active version, the draft, the history and the conflicts. Called on open and after every action |
| `startDraft()` | Starts a draft - from the active version, or from the starter when there is none |
| `changeDraft(version, expectedRevision, changes)` | Makes the changes in the draft's text, together |
| `discardDraft(version)` | Throws the draft away |
| `submitDraft?(version, expectedRevision)` | Puts the draft up for review. Without it the editor offers no review step |
| `activateDraft(version, expectedRevision)` | Makes the draft the active version |
| `confirm?(confirmation)` | Asks a question before a decision that is hard to take back (start, discard, activate). Without it the editor asks in a bar above its sections |
| `conflicts?` | `decide(entry, chosen)` keeps one of two values the sources use for the same purpose; `raiseIssue?(entry)` opens an issue for the code that should change |
| `standard?` | `find()` reports what each screen has outside the design system; `raiseIssue?(issue)`, `useToken?(entry, replacement)` and `propose?(entry)` are the ways of bringing it back, each offered only when present |
| `preview?` | `available` says whether the host can draw now; `draw()` returns the draft beside the active version on the host's screens |
| `sections?` | Sections the host adds to the navigation, each drawn by the host with the state, theme and mode |

`load()` answers a `DesignSystemState`: `active` and `draft` (each a `DesignSystemVersion` with its `number`, `revision`,
resolved `designSystem`, `screenplay` text, `outline` of the profile, layouts and templates, and `authoredBy`), the `history`
(newest first; the editor derives who wrote the draft, who submitted it and whether it waits for a review from it) and the
`conflicts` of the draft. A version whose Screenplay could not be read as a design system has no `designSystem`; the editor says
so and offers to start a draft from the starter.

### Where the editor is looking

The editor keeps its own place by default. A host that wants it in its address passes `view` and `onViewChange`:

```tsx
<DesignSystemEditor host={host} view={view} onViewChange={setView} />
```

`DesignSystemView` holds the `version` (`'draft'` or absent), `mode`, `theme`, `section`, `component` and `variant`. Every
member is optional, and an unknown or unavailable choice falls back to what there is.

### Words

The editor has no language of its own. It ships English defaults (`defaultDesignSystemEditorStrings`) and takes a
`DesignSystemEditorStrings` as `strings` to translate or rename anything. A `{name}` in a string is filled in by the editor
(`fill`). A host passing partial strings spreads the defaults first:

```tsx
<DesignSystemEditor host={host} strings={{ ...defaultDesignSystemEditorStrings, title: 'Designsystem' }} />
```

### Styling

The editor draws with the Cratis Components custom properties (`--cratis-text-color`, `--cratis-surface-card`,
`--cratis-surface-border`, `--cratis-primary-color`, `--cratis-border-radius` and the like) and with `@cratis/components` for
buttons, inputs and tags, the same as the other designers. Its own rules are in `DesignSystemEditor.css`, imported by the
component, and every class is prefixed `studio-design-system`. The samples of the design system (a swatch, a component drawn from
its resolved parts) are drawn with the design system's own values, not the host's.

## Running it without a host

`createFakeDesignSystemHost` keeps a design system in memory. A draft really changes as it is edited - the change addresses are
applied to the design system by `applyDesignChange` - and every call is recorded in `host.calls`, so a specification can say what
the editor asked for:

```ts
import { createFakeDesignSystemHost } from '@cratis/scene.editor';

const host = createFakeDesignSystemHost({ person: 'ada', draft: true, conflicts, standard, preview });
await host.changeDraft(2, 1, [wordChange('voice', 'tone', 'Warm')]);
host.calls;   // [{ member: 'changeDraft', args: [2, 1, [...]] }]
host.actAs('grace');   // someone else looks from now on
```

Its options switch the optional seams on (`conflicts`, `standard`, `preview`), `refuse` makes every action that changes
something answer a refusal, and `review: false` leaves out the review step. It is what the Storybook stories
(`yarn dev` in `Source/JavaScript/editor`, then *Editor / Design system*) and the editor's specifications run against.

## Moving from Direct

Direct's design-system views are this editor with their Arc proxies, routing and read-model types replaced by the seam:

| Direct | Here |
|---|---|
| `DesignSystemResolution` read model | `DesignSystem` of `@cratis/scene.model`, with contrast from `measureDesignContrast` |
| `StartDesignSystemDraft`, `ChangeDesignSystemDraft`, `DiscardDesignSystemDraft`, `SubmitDesignSystemDraftForReview`, `ActivateDesignSystemDraft` commands | `startDraft`, `changeDraft`, `discardDraft`, `submitDraft`, `activateDraft` |
| Conflict and off-standard commands (decide, raise an issue, use token, propose to the system) | `conflicts` and `standard` |
| Preview on screens (the draft drawn beside the active version) | `preview` |
| Muse (the assistant) | `sections`: a host that has an assistant adds its panel as a section; its history entries use the `draftRevisedByAssistant` kind |
| The address of the page (`?section=`, `?theme=`) | `view` and `onViewChange` |
| `Dialogs` and `DialogResult` | `confirm`, or the editor's own bar |

## Where it is

Everything is under `DesignSystem/` in the package: `DesignSystemEditor`, the sections (`Browsing/`), editing (`Editing/`),
`Conflicts/`, `Standard/`, `Previewing/`, the `Resolving/` helpers (`designEdits`, `designResolution`, `designChanges`) and
`Testing/` (the fake host and a sample design system). All of it is exported from the package root and from
`@cratis/scene.editor/DesignSystem`.
