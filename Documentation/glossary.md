---
title: Glossary
description: The vocabulary Scene shares with Screenplay — layouts, slots, templates, elements, behaviors, actions and routes — with one meaning per word.
---

Scene renders what Screenplay declares, so the two share a vocabulary. Where a word already means something in
Screenplay, that meaning wins here — this page says what each term is *in Scene*, and which record or type is
authoritative.

## The document's shapes

These arrive from the model. Scene does not reinterpret them.

| Term | Meaning | Authoritative in |
| --- | --- | --- |
| **Layout** | The application's base navigational shell. One per build, selected by a UI profile. | `Model/Layouts/Layout` |
| **Slot** | A named region a layout or template declares. Filled by one parent, or opened to many by declaring a contribution point. | `Model/Layouts/Slot` |
| **Screen template** | A reusable shape inside the shell. Says which slot of its parent it fills with `fits slot`; nesting is matched by slot name, to any depth. | `Model/Screens/ScreenTemplate` |
| **Dialog template** | A shape that opens *over* the application. Never fills a slot. | `Model/Screens/DialogTemplate` |
| **Screen** | An instance filling a template's slots. Never names a layout directly. | `Model/Screens/Screen` |
| **Element** | A node in a screen's content tree. | `Model/Elements/SceneElement` |
| **Arrangement** | How a layout or template positions its slots — `flow` or `freeform`, varying by size class. | `Model/Layouts/Arrangement` |
| **Size class** | `compact`, `regular` or `expanded`, on the width and height axes. A class, not a pixel breakpoint. | `Model/SizeClasses/` |
| **Contribution point** | A named many-to-one extension point declared on a slot. | `Model/ContributionPoints/ContributionPoint` |
| **Contribution** | One piece of content targeting a contribution point. | `Model/ContributionPoints/Contribution` |
| **Form** | A command or query input surface with its fields and how they populate. | `Model/Forms/Form` |
| **UI profile** | A build's selections: platform, size, layout, theme, packages, blueprint, start screen. Names artifacts; never contains them. | `Model/Profiles/UiProfile` |

## Interaction

What happens when a user does something. The vocabulary is closed and every operand is a model reference, which
is what makes an interaction that names nothing real a diagnostic instead of a dead control.

| Term | Meaning |
| --- | --- |
| **Interaction trigger** | What starts an interaction — a click, a submit, a screen becoming live, an observed domain event, an elapsed interval, or a declared application trigger firing. Anonymous: it exists only inside a behavior. |
| **Application trigger** | Screenplay's declared top-level signal consumed by backend reactions. A different concept with a similar name — an interaction may `raise` one, which is how the two connect. |
| **Action** | One declarative effect: execute a command, navigate, open or close a dialog, refresh a query, set state, notify, confirm, raise. |
| **Continuation** | The `on success` / `on failure` / `on result` actions that run after an action that can fail. |
| **Behavior** | A bundle of interaction-trigger-to-action bindings, attachable to an element, form, screen, template, layout, module or feature. Anonymous when written inline; named when reusable. Attachments are additive — a template's behavior and an element's both run. |
| **Action dispatcher** | The seam a renderer implements, one method per action kind. The engine sequences actions and handles continuations; the dispatcher performs the effects. |
| **Interaction context** | What an action's bindings resolve against: route parameters, screen state, the triggering item, the form's values, the trigger's payload. |

## Runtime

| Term | Meaning |
| --- | --- |
| **Route** | The renderer's concrete address for a screen. The model never contains one. |
| **Screen state** | A screen's declared values: route-backed `accepts`, and transient `state`. Owned by the engine, subscribed to by the renderer. |
| **Query state** | Where a query-backed element stands: idle, loading, loaded or failed. |
| **Finding** | A structured report that something did not resolve. Rendered in place and collectable, so "this application has no findings" is a check rather than an opinion. |

## Packaging

| Term | Meaning |
| --- | --- |
| **Package** | A named set of components a profile draws from, in override-priority order. `core` is the final fallback. |
| **Blueprint** | A shipped bundle: layouts, shell chrome, a template set and theme tokens. Selected by name in a UI profile, the same way a theme is. |
| **Theme** | A set of visual tokens, compatible with one or more packages. |
| **Shadowing** | A higher-priority package supplying a component by the same name, overriding a lower one. |

## The layers themselves

| Term | Meaning |
| --- | --- |
| **Scene model** | The platform-neutral UI model: `Cratis.Scene.Model` in C#, mirrored by `@cratis/scene.model`. The wire contract. |
| **Scene engine** | `@cratis/scene.engine` — pure functions over the model. No DOM, no framework. |
| **Scene renderer** | `@cratis/scene.react` and its siblings. Owns URLs, the DOM, effects and transports. |

## See also

- [Layering and seams](architecture/layering.md) — which layer may know what, and the invariants that enforce it.
- Screenplay's own glossary — the language-side definition of every modeled construct.
