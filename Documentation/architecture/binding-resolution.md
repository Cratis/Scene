---
title: Binding resolution
description: How the shared binding resolver reads data context, query results, component outputs and literals, nests template scopes and discards stale query results, identically in TypeScript and C#.
---

A Scene binding names where a value comes from instead of carrying the value. The TypeScript engine (`resolveBindingExpression`, `validateBindingExpression`) and the C# engine (`Cratis.Scene.Engine.Bindings.BindingResolver`, `BindingValidation`) resolve the same document to the same value and report the same diagnostics. Both run the shared `binding-resolution-fixtures.json` corpus.

## Sources

| `kind` | Reads |
| --- | --- |
| `dataContext` (or absent) | `path` in the inherited data context |
| `queryResult` | `path` in the named `query`'s result |
| `componentProperty` | `componentPropertyPath`, or `path`, in the outputs of the element `componentId` |
| `literal` | `value` itself |

A path is dotted. It reads only own object properties and array indexes such as `lines.0`; anything else, including `length` and inherited members, is absent.

## Null behavior

When the value is null or absent, `nullBehavior` decides what the target receives: `propagate` (the default) passes it on as it is, `clear` turns it into null, and `preserve` makes it absent so the target keeps its current value. A literal without a value counts as absent.

## Diagnostics

Validation reports, in this order: a `queryResult` binding without a query (`missingQuery`); a `componentProperty` binding without a component (`missingComponent`), with an unknown component (`unknownComponent`), on its own element or through a chain of elements being resolved (`bindingCycle`); a two-way binding to anything but a component output (`unsupportedTwoWayBinding`); and a resolved value that does not match `expectedValueType` (`bindingTypeMismatch`).

## Nested scopes

A nested template or region sees a nested scope (`nestBindingScope`, `BindingScope.Nest`). Its own data context replaces the inherited one, so a detail region bound to the selected row reads that row. Query results and component outputs are inherited, and the nested scope's own entries shadow the parent's of the same name. In React, a `RenderBindingScopeProvider` inside another nests this way.

## Lifecycle cleanup

When elements leave the tree, are deleted or are renamed to a new id, their outputs are removed (`removeComponentOutputs`, `BindingScope.WithoutComponentOutputs`). A binding to them then resolves as absent and validates as `unknownComponent`.

## Query rebind

`QueryBindingState` keeps the results of bound queries as their arguments change. Each run starts a new generation, and a result is accepted only for the latest generation of its query, so a slow answer for a previous selection is discarded. Clearing a query removes its result and invalidates any run in flight. In React, `useBoundQuery` reruns a query when its arguments change, aborts the previous run, and clears the result when the arguments become unavailable or the current run fails.
