# Guarded actions and interactions

A guarded action chooses the first command whose structured condition matches the current item. Scene renders one button, not one per branch. Selection is a presentation decision, **not authorization**: the host must still validate and authorize the command.

## Guarded command action

Use `core:guarded-action`. Existing Stage documents using `core:action` with an `alternatives` property are mapped to the same component. An ordinary `core:action` with `command` is unchanged.

The open `properties` bag has this shape:

```json
{
  "label": "Approve",
  "item": {
    "kind": "componentProperty",
    "path": "selectedItem",
    "componentId": "orders",
    "componentPropertyPath": "selectedItem"
  },
  "alternatives": [
    {
      "command": "ApproveOrder",
      "condition": {
        "kind": "comparison",
        "left": { "subject": "item.status" },
        "operator": "Equal",
        "right": "Pending",
        "enumeration": ["Pending", "Approved"]
      },
      "arguments": { "orderId": { "subject": "item.id" } }
    }
  ],
  "otherwise": { "outcome": "Hidden" },
  "navigateToScreen": "details",
  "navigateByParameter": "id"
}
```

`item` is a normal Scene binding, resolved reactively by the renderer. When it is omitted, the current render data context is the subject. Scene never guesses a row from a query's first result. No selected item means no action, **even with an executable fallback**.

Alternatives are checked in order; only the first match is selected. Omit `otherwise`, or use `{"outcome":"Hidden"}`, to hide the button when none matches. An executable fallback uses `{"outcome":"Execute","command":"ReviewOrder","arguments":{"orderId":{"subject":"item.id"}}}`.

Arguments remain `{ "subject": "item.field" }` references, rather than binding expressions. Scene resolves them only at invocation. The dispatcher receives the selected `item` alongside the explicit arguments; an explicitly mapped argument named `item` takes precedence. Unresolved explicit arguments refuse execution. The button has `data-scene-command`, disables while its command is pending, and displays failures. A changed branch at click time causes a re-render without executing the stale choice.

With an `InteractionScope`, Scene calls `dispatcher.executeCommand(command, args)` and navigates **only after a successful outcome**, using `dispatcher.navigate(screen, { [navigateByParameter]: item[navigateByParameter] })`. Without a navigation parameter, the arguments are empty. Failure does not select a different branch or run the fallback.

Without an interaction scope, Scene dispatches `cratis.scene.command` on `window` with this detail:

```typescript
{
    command,
    element,
    arguments: resolvedExplicitArguments,
    item,
    navigateToScreen,
    navigateByParameter
}
```

That event is the host's execution seam. The host owns completion, failure reporting and navigation after success; Scene does not infer success from event delivery. The host must also prevent duplicate submissions while its asynchronous event handler runs.

C# callers can use `GuardedActionProperties.Read(externalComponent)` and `ToProperties()` from `Cratis.Scene.Model.Guards` instead of hand-reading a JSON-backed dictionary. The matching TypeScript interfaces are exported by `@cratis/scene.model`.

## Guard vocabulary

A comparison contains `kind: "comparison"`, a `left` subject reference, an `operator` and a scalar `right` literal. Supported operators are `Equal`, `NotEqual`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, `Contains` and `StartsWith`.

- Paths start with `item.` and may traverse nested object properties. Unsafe prototype paths and malformed paths are unsupported.
- Equality is type-strict. Missing fields never match. A **present null** matches a null literal with `Equal`; `NotEqual` involving null is false.
- Ordering requires numeric values; strings are not coerced to numbers.
- `Contains` supports a string substring or scalar array membership; `StartsWith` requires strings. String matching is case-sensitive.
- An optional `enumeration` lists member names in ordinal order. A subject ordinal or member name resolves to the member name. Enum names compare case-insensitively; unknown names and out-of-range ordinals do not match.
- A logical node is `{"kind":"logical","operator":"And","left":condition,"right":condition}`, or uses `Or`. Both branches must be understood, even if one branch would determine the answer.

Unknown operators, node kinds and legacy string guards fail closed with `SCENE-GUARD-001`. A guarded action renders a disabled button and diagnostic rather than using its fallback. There is no JavaScript expression execution.

`GuardConditions` and `GuardedSelection` in `Cratis.Scene.Engine.Guards` mirror `canEvaluateGuard`, `evaluateGuard`, `selectGuardedAction` and `selectGuardedInteraction` in `@cratis/scene.engine`. Their shared examples are in `guarded-selection-fixtures.json`.

## Guarded interaction binding

An interaction can select a whole action list instead of a single command:

```json
{
  "trigger": { "kind": "Click" },
  "actions": [],
  "alternatives": [
    {
      "condition": {
        "kind": "comparison",
        "left": { "subject": "item.canApprove" },
        "operator": "Equal",
        "right": true
      },
      "actions": [{ "kind": "ExecuteCommand", "command": "ApproveOrder" }]
    }
  ],
  "otherwise": [{ "kind": "OpenDialog", "dialogTemplate": "ReviewOrder" }]
}
```

Set `actions` to an empty list when supplying `alternatives`; combining a nonempty `actions` list with alternatives is refused. The gesture's subject comes from `InteractionContext.subject()` when supplied, then `resolve({path: 'item'})`. React supplies the render data context when no explicit subject callback exists.

The engine reads the subject once, selects once, and runs the chosen list with the existing sequencing rules. A command failure never falls through to another branch. With no subject, nothing runs, including `otherwise`. With an evaluable no-match and no `otherwise`, nothing runs. An unknown predicate reports an `unevaluableCondition` finding, with `SCENE-GUARD-001`, and does not execute otherwise.

The existing binding-expression `condition` remains unchanged, including host-owned `$guard` resolution. Existing `actions`-only bindings and the three-parameter C# `InteractionBinding` constructor remain available.

## Stage adoption

After releasing Scene, Stage can bump its Scene npm and NuGet references, emit `core:guarded-action` with an explicit selected-item binding, emit one interaction binding with ordered alternatives, and provide the gesture subject. Stage must still supply command routes and forms for every alternative and executable fallback. Legacy string guards must be converted to structured guards, not evaluated as code. These Stage changes are a separate change; this Scene feature does not modify Stage or its refusal policy.
