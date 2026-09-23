---
title: Layering and seams
description: The six layers a modeled application passes through, the rule that keeps them apart, and the invariants CI enforces so they stay that way.
---

A Screenplay document describes an application. Something has to turn that description into pixels a user can
click. Scene is the middle of that journey, and the whole design rests on one rule about who is allowed to know
what.

## The layers

```text
Screenplay (.play)              The model. Declarative, portable, human-authored.
        │                       Knows nothing about React, URLs, HTTP or CSS.
        ▼  compile
Screenplay semantic model       The compiler's answer: syntax → semantics.
        │
        ▼  convert
Scene model                     The platform-neutral UI model. Serializable — the wire contract.
  Cratis.Scene.Model            Still knows nothing about React or URLs.
  ≡ @cratis/scene.model
        │
        ▼  serve
Scene engine                    Pure functions over the model: resolve, evaluate, aggregate, bind.
  @cratis/scene.engine          Platform-neutral. No DOM. No framework.
        │
        ▼
Scene renderer                  Turns engine output into platform widgets.
  @cratis/scene.react           Owns URLs, the DOM, effects and transports.
        │
        ▼
Packages and blueprints         core → components → primereact/tailwind → blueprints.
                                Blueprints supply the shell chrome and the template set.
```

## The seam rule

**Each layer may only know about the layer directly above it.** Four consequences do all the work:

| Rule | Why |
| --- | --- |
| The Scene **model** contains no URL, CSS class, React type or HTTP verb. | It is the wire contract, and a future MAUI or Compose renderer has to be able to honour it. |
| The Scene **engine** imports no framework and touches no `window`. | Its behaviour must be assertable without a DOM. That is what makes the data lifecycle testable rather than observable-by-screenshot. |
| The **renderer** is the only place a URL is constructed. | The model says `navigate to <Screen>`; deciding that means `/invoicing/invoices` is a platform decision. |
| Only **Stage** knows what an Arc endpoint is. | The engine asks a transport for a query's result; it never knows a route existed. |

The existing `NavBar` is the pattern in miniature: it takes a `renderRoute` callback rather than building a path,
because at that layer the path is not yet knowable. Every new surface follows it.

### What "platform-neutral" buys

It is tempting to read the seam rule as ceremony — the application is a web application, so why should the
engine pretend otherwise? Two reasons, both practical:

- **Testability.** A pure engine lets "entering this screen runs that query once, with these parameters, and does
  not re-run on an unrelated change" be a unit test. Behind a DOM, the same assertion needs a browser and becomes
  flaky.
- **Honesty about the model.** If the engine may reach for `window`, the model slowly stops being a model. The
  first `location.href` is the point where the document stops describing an application and starts describing a
  web page.

## The invariants

These are checked, not aspirational.

| # | Invariant | How it is checked |
| --- | --- | --- |
| I1 | The Scene model serializes to canonical, stable JSON. | `Stage` — `for_CanonicalSceneJson/when_serializing_the_same_scene_twice`. |
| I2 | The C# model and the TS mirror agree. | `scene-model-shape.json` plus both sides' shape specs. |
| I3 | The engine and model have no framework or DOM dependency. | ESLint: restricted imports and globals over `engine/**` and `model/**`. |
| I4 | No URL is constructed outside a renderer package. | ESLint: no route-template literals in `engine/**` or `model/**`. |
| I5 | Every reference either resolves or produces a diagnostic. | Compiler diagnostics plus the frontend finding surface. |
| I6 | A construct that reaches the model reaches the renderer, or is reported. | `Stage` — `for_UnrenderedConstructs`. |
| I7 | Enum members are never silently renumbered. | The append-only rule in Screenplay's `ast-compatibility.md`. |

### I3 and I4 in practice

Both live in `eslint.config.mjs` as a configuration block scoped to `Source/JavaScript/engine/**` and
`Source/JavaScript/model/**`. A violation fails the lint run with an explanation rather than a rule name:

```text
error  I3: 'document' is a host environment API. The engine and the model must run without a DOM — take it
       as an injected seam (a transport, a dispatcher, a store) supplied by the renderer.
error  I4: no URL is constructed outside a renderer package. The model and the engine deal in screen
       references and parameter maps; a renderer turns those into a path.
```

The same code in `react/**` lints clean. That asymmetry *is* the seam.

When the engine genuinely needs an effect, the answer is an injected seam, not an exception: a transport for
data, a dispatcher for actions, a store for state. The engine sequences; the renderer performs.

## Where decisions are recorded

The layering is the consequence of a set of recorded decisions rather than a matter of taste. The architecture
decision records covering it: interaction location, trigger vocabulary, blueprint as a selection, the URL
scheme, screen state ownership, the frontend failure posture, and multi-file project semantics.

## See also

- [Glossary](../glossary.md) — one meaning per word, shared with Screenplay.
- [Blueprints](../blueprints/index.md) — what a blueprint bundles and how a profile selects one.
