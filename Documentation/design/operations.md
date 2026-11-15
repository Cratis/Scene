---
title: Design operations
description: The operations a designer applies - screens, components, properties, links, profile, variations, tweaks and refusals, in screen and template mode - how they are checked against the catalogue and lowered to Scene edits, and what a refusal carries.
---

A design operation is plain data that names one change. Operations are checked, lowered to Scene edits and applied through the engine, so a document that comes out is one Scene accepts.

```ts
const result = applyDesignOperations(workspace, operations, createDesignContext(catalogueInput));
// result.workspace  - document, profile and screen set after
// result.outcomes   - one per operation: applied, or refused with a reason and alternatives
```

```csharp
var result = DesignOperations.Apply(workspace, operations, DesignContext.Create(input));
```

The workspace is the Scene document, the UI profile and the [screen set](screen-set.md). Operations run in order; a refused operation changes nothing and the ones after it still run against the design as it then is.

## The operations

| `op` | Does |
| --- | --- |
| `addScreen` `{ name, template }` | Adds a screen built on a catalogue template; declares the template in the document if it is not there; appends the screen to the screen set. |
| `removeScreen`, `moveScreen` | Removes (warns about links to it: `linkDangling`) or reorders; the default storyline follows. |
| `insert` `{ screen \| template, outlet, component, index?, id?, props? }` | Puts a component in an outlet. The id is made deterministically (`stat-card-1`) unless given. |
| `set` `{ element, prop, value }`, `remove`, `move` | Changes an element. |
| `link` `{ element, to, prop? }` | Makes an element navigate to a screen of the design. |
| `profile` `{ key, value }` | Changes `theme`, `colorScheme`, `accent`, `corners`, `font`, `rootTemplate` or `newScreenTemplate`. |
| `variations` `{ screen, templates? }` | Offers up to three layouts of a screen on other templates, saying what did not fit. Changes nothing until one is chosen. |
| `tweaks` `{ controls }` | Offers up to five controls (a hue or a choice) bound to a profile key, an element property or a token. |
| `refuse` `{ code, reason, alternatives? }` | Says no. |

**Template mode** adds `addTemplate` (slots, arrangement, outlets, type), `addSlot`, `removeSlot` and `arrange`; `insert`, `set`, `remove`, `move` and `link` name a `template` instead of a `screen`. They lower to Scene edits in the `screenTemplate` editing scope.

## Checks

Before lowering, an operation is checked against the catalogue:

| Check | Refusal code |
| --- | --- |
| The component, template, screen, element or outlet exists | `componentNotInCatalogue`, `templateNotInCatalogue`, `screenUnknown`, `elementUnknown`, `outletUnknown` |
| The outlet takes the component, and has room | `outletDoesNotAccept`, `outletFull`; overlays `overlayNeedsAction`; shell components `shellComponent` |
| The property exists and takes the value (kind, range, choices, query exists) | `propertyUnknown`, `valueNotAllowed`, `queryUnknown` |
| The variant is one the design system declares | `variantNotInDesignSystem` |
| **No free styling** (`background`, `color`, `padding`, `className`, `style`, ...) | `freeStylingNotAllowed` |
| **No value of its own** (a hex colour, `linear-gradient(...)`, markup); an `accent` the design system has no colour for | `offSystemValue` |
| Profile keys and values | `profileKeyUnknown`, `profileValueNotAllowed`, `noProfile` |
| Template mode: slots and arrangement are consistent | `slotExists`, `slotUnknown`, `slotInUse`, `arrangementInvalid` |
| Exactly one of `screen` and `template` is named | `targetMissing` |
| The engine accepts the Scene edit | `sceneRefused` (with the engine's own `scene.*` diagnostics) |

## What a refusal carries

```json
{
  "applied": false,
  "code": "variantNotInDesignSystem",
  "reason": "The design system has no 'danger' variant of Button. Variants: primary, secondary.",
  "alternatives": [
    { "label": "Use primary", "operations": [{ "op": "set", "screen": "InvoiceDetails", "element": "pay", "prop": "variant", "value": "primary" }] },
    { "label": "Propose it to the design system", "proposal": { "kind": "variant", "component": "Button", "variant": "danger", "summary": "Add the danger variant of Button" } }
  ],
  "diagnostics": [{ "code": "variantNotInDesignSystem", "severity": "error", "message": "...", "screen": "InvoiceDetails", "element": "pay" }]
}
```

Alternatives are the nearest accepted operations: the outlets that do take a component, the templates of the set, the variants the component has, the queries that exist, the values a profile key takes - and,
for free styling and off-system values, a **design-system proposal** (a token, a variant, a word, a component) that the host can route to the design-system draft. Every outcome - applied or not - has `diagnostics`.

## Template set

A session can restrict the templates it may use (`templateSet`). The catalogue lists only those; `addScreen`, `variations` and every change to a template outside the set is refused with `templateNotInSet` and alternatives
from the set.

## Variations and tweaks

`variations` returns candidates `A`, `B`, `C`: the screen's content re-homed on another template wherever an outlet takes it. A caller prints them as Screenplay text into the session (a `VariationsProposed` event) and,
when one is chosen, `chooseVariation` / `DesignVariations.Choose` replaces the screen. `lowerTweak` / `DesignTweaks.Lower` turns a control moved to a value into operations (a profile key or an element property) or into
a design-system proposal (a token - the canvas edits screens only).
