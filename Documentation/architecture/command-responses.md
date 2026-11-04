# Command responses and form continuations

A form's `onSubmit` actions run **after its native command succeeds**, not when the user presses Submit. Arc still owns form execution, validation, authorization and exception feedback. Scene forwards the native success response without executing the command again. An absent or empty `onSubmit` preserves the existing form behavior.

## Supply source and destination contracts

Before a continuation can use a response value, the host must describe both what the command returns and what the destination accepts. Response contracts are producer-supplied validation inputs, not persisted command catalogs. TypeScript hosts implement `ResponseValidationContracts`; C# producers implement `IResponseValidationContracts`:

- `commandResponse(command)` returns `{ kind: 'void' }`, or `{ kind: 'value', type }`. Unknown metadata returns `undefined` in TypeScript or null in C#; unknown is not void.
- A value type has `kind: 'string'`, `'number'` or `'boolean'`; an object adds `properties`, and an array adds `item`. Any type can be `nullable`.
- `targetType(action, operand)` supplies the actual destination type. An operand is an `argument` with a `name`, a `stateValue`, or a `message`.

Normalize concepts to their actual JSON types and use emitted wire member names. Input schemas and response-kind flags alone do not describe a response's structure. Object destinations require assignable fields; extra source fields are allowed. Array items are checked structurally, primitives are not coerced, and nullable sources need nullable destinations. `expectedValueType` is an additional category check, never a replacement for source or destination metadata. Response bindings are one-way only.

Call `validateResponseBindings(entry, contracts)` in TypeScript or `ResponseBindings.Validate(entry, contracts)` in C#. An entry is either `{ kind: 'actions', actions }` or `{ kind: 'form', command, onSubmit }`. Validation walks every continuation, even a branch that is not selected at runtime. Response-independent actions need no metadata.

For execution, provide the same metadata through `InteractionContext.responseContracts` on the enclosing `InteractionScope`.

## Bind the successful response

For a command returning `{ "projectId": "created-id" }`, a form can navigate using that id. The host's source metadata must describe `projectId`, and its destination metadata must describe the navigation argument `id`:

```json
{
  "name": "Create project",
  "forCommand": "CreateProject",
  "fields": [],
  "onSubmit": [
    {
      "kind": "Navigate",
      "screen": "project-detail",
      "arguments": [
        {
          "name": "id",
          "value": { "kind": "commandResponse", "path": "projectId", "expectedValueType": "string" }
        }
      ]
    }
  ]
}
```

After `CreateProject` succeeds, the form's `onSubmit` continuation reads `projectId` from that response and passes it as `id` to `project-detail`. Scene validates the projected value against the destination argument's actual type before navigating; `expectedValueType` adds the string-category check but cannot supply either missing contract. The response is available in this success continuation, not as a last-response value for later, unrelated actions.

The same binding works inside an `ExecuteCommandAction.onSuccess` list. An empty path selects the entire scalar or object response. False, zero and an empty string are present responses. For a directly returned address, `street` selects its street; for `{ "address": { "street": "Main" } }`, use `address.street`.

Unlike ordinary Scene bindings, which can read array indexes, response paths traverse only own, named object properties. Missing members, inherited members, prototype paths, indexing, wildcards and array traversal are refused. An array-valued member can be copied whole when its item type fits the destination; a top-level collection response is not supported. A present nullable object makes projections through it nullable. A missing response or member is never made valid by `nullBehavior`. Arc omits top-level null responses, so they are unavailable to response-dependent actions.

## Run in a lexical scope

Scene's shared runner and native form bridge use `commandResponseContext` to decorate the existing resolver; non-response bindings still delegate to it. A response binding reads the response available to the current continuation, not whichever command happened to finish last.

A successful command replaces the response only inside its `onSuccess` continuation. If that continuation executes a nested command, the nested success actions see the nested response; returning from the nested command restores the outer response. Later siblings do not acquire a preceding command's response, so an action that needs a command's result belongs in that command's success continuation. Non-command continuations inherit their existing scope, and concurrent runs have no shared last-response state.

Failure continuations mask any enclosing response, including a payload returned with a failed outcome. A failure handler therefore cannot read an outer success response as though it belonged to the failed command.

Before an effect runs, Scene checks response operands and their actual values. Missing data, unknown metadata or incompatible values produce an `invalidResponseBinding` finding and a `Reported` stop instead of dispatching an undefined argument. Navigated, Declined and Reported stops propagate through enclosing continuations. Response-independent success actions can run even when the command returns nothing.

Guarded selection is independent of response binding. These bindings do not introduce a guard predicate source or weaken command authorization.
