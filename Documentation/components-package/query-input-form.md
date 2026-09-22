---
title: Query input form
description: An opt-in web form for explicit string arguments to an optional-single Arc query.
---

`Cratis.Components:queryInputForm` owns local string drafts and commits them only on form submission
(the submit button or native Enter submission). It uses the same private `SingleResultRuntime` as
`singleResult`, not another executor. No default screen, platform-neutral Form schema, expression
language, command context or cross-component binding is introduced.

## Host and Scene payload

The host supplies the actual generated Arc proxy and its Arc context. Stage can emit the following
registration and ExternalComponent properties; these are package contracts, **not new Screenplay syntax**:

```typescript
import { registerQueryIdentity, type QueryInput } from '@cratis/scene.components';
import { ProjectName } from './Projects/Queries/ProjectName';

// Identity is a stable, unique generated source identity, not the entered project identifier.
registerQueryIdentity('ProjectName', 'Projects/Queries/ProjectName', ProjectName);

const inputs: QueryInput[] = [
    { parameter: 'projectId', type: 'string', label: 'Project identifier' },
];
const properties = {
    query: 'ProjectName',
    inputs,
    resultField: 'name',
    label: 'Find project',
    submitLabel: 'Search',
};
// Place properties on an ExternalComponent with componentName 'Cratis.Components:queryInputForm'.
```

Use the **exact case-sensitive query name and argument names** emitted by the proxy. There is no route
in the form, no guessed project, no all-projects fallback and no parameter inference. It requires a
zero-argument native optional-single proxy (`enumerable === false`). Enumerable proxies fail before
`perform`. The host supplies Arc/Arc React 22.16.1 or compatible peers as for `singleResult`, plus the
matching Fundamentals peer (7.19.2 or compatible, already required by Arc) for `Guid` constructor identity.

| Property | Contract |
|---|---|
| `query` | Required exact registered name. Missing/ambiguous bindings are visible and do not execute. |
| `inputs` | Required nonempty array of string input declarations. Duplicate parameter names or any malformed entry reject the entire form visibly. |
| `resultField` | Required nonempty name of one own scalar result field; not a property path. |
| `label` | Accessible form name; defaults to `Query input`. |
| `submitLabel` | Submit button text; defaults to `Search`. |

Each input has a nonempty string `parameter`, literal `type: 'string'`, nonempty string `label`, optional
boolean `required` (defaults to true), and optional string `pattern`. `pattern` is an authored whole-value
JavaScript Unicode regular expression without delimiters, for example `[A-Z]{2}-[0-9]{2}`. Invalid regular
expressions are configuration errors. There is no inferred GUID/email/business format. Required inputs
reject empty or whitespace-only strings. Other values, including surrounding whitespace, remain exact:
**no trimming, coercion or generated identifiers**. Optional empty strings remain present in the snapshot;
proxy required-argument rules may still reject them. No initial/default argument values or slots are read.
The pattern wrapper uses Unicode mode without multiline mode: final newline characters do not satisfy
an otherwise digit-only pattern. Values explicitly allowed by a pattern are still submitted unchanged.

At the actual lazy native boundary, every declared argument must match **exactly one** proxy
`parameterDescriptors` entry by exact name. Only scalar `String` and `Guid` constructor types are
supported for `type: 'string'`; numeric, boolean, unknown/missing, duplicate or enumerable descriptors
fail visibly before `perform`/HTTP. This is a bounded form mapping check, not type inference or a change
to `singleResult`'s host-supplied arguments. Strings are never converted into Guid objects. A generated
`projectId: Guid` with `new ParameterDescriptor('projectId', Guid, false)` is supported unchanged.
Arc 22.16.1 does **not** enforce descriptor argument types or GUID string format in native `perform`.
If format enforcement is desired, Stage must supply an explicit input `pattern` (or the proxy/backend
must validate it); a nonempty malformed GUID can otherwise reach HTTP unchanged.

## Submission and lifetime

- Controls are accessible, controlled native web text inputs with associated labels, required state,
  inline validation alerts, `aria-invalid` and `aria-describedby`. Components' `InputTextField` is wrapped
  in `asCommandFormField` and requires command context; it is deliberately not repurposed with a fake command.
- Editing never imports the execution runtime or calls a query. Submission validates required values and
  declared formats first. Invalid inputs stay visible and make no native `perform` or HTTP call.
- Valid submission creates a **new frozen argument object** containing only the declared exact names and
  strings. Repeated submission of identical values explicitly retries, including a pending request.
- Editing any draft immediately hides a settled result and unmounts/cancels a pending runtime. Editing
  back to the previous string does not resurrect that result: another submission is required.
- Native `QueryFor.perform` still owns proxy validation, required arguments, routing, HTTP and
  deserialization. A generated-validator rejection is visible as `Unable to load result`, with no HTTP;
  drafts remain editable. Scene does not expose server exception details or duplicate proxy/business
  validators. The form-only descriptor compatibility check above precedes native validation.
- Result, `Not found`, loading/failure, Arc context changes, abort and stale-response suppression are the
  existing `singleResult` behavior. Result strings are escaped text; only own string/finite-number/boolean
  fields are displayed. Successful missing models are not collections.
- Equivalent host rerenders retain drafts. A changed query name/input declaration/result field starts a
  fresh session. Disabling the Scene element, losing the binding or unmounting cancels and discards it.
  A replacement constructor for the same source identity reexecutes committed arguments through the
  existing runtime (and cancels the old generation). Arc context changes do the same.

## Collision-aware registration for Stage

`registerQuery`/`registerQueries` **still replace by name** for hot reload. `resolveQuery` always uses
that legacy registration when present, even if there are identity registrations. Without a legacy
registration it returns the unique identity-only constructor. Zero or multiple identities return
`undefined`; existing tables/data pages/`singleResult` show their unresolved-binding placeholder and
select no candidate. These existing adapters retain their render-time lookup contract (host rerender
is needed after registry changes); command resolution is unchanged.

For collision detection, Stage should emit **one `registerQueryIdentity(name, sourceIdentity, proxy)`
call per source**, not first collapse exports into a name-keyed object. The same `(name, sourceIdentity)`
replaces on hot reload; two different identities are ambiguous even if they share a constructor.
`unregisterQueryIdentity(name, sourceIdentity)` removes a deleted/renamed source. `clearBindings()` clears
both namespaces, including when switching applications.

`resolveExactQuery(name)` remains stricter: it returns a constructor, `'ambiguous'`, or `undefined`,
counting a legacy registration as one additional candidate. Thus mixed legacy/identity registrations
are ambiguous for `queryInputForm`, even though legacy adapters still prefer the legacy registration.
Stage should emit **only the identity registration per source for the same semantic name**; there is
no need to duplicate `registerQueries` for existing authored tables or `singleResult`.
`registeredQueryNames()` is the sorted, deduplicated union of both namespaces, including ambiguous
names. Removing the final identity removes that name unless a legacy registration remains.
`subscribeQueryBindings(listener)` notifies live exact-binding consumers; `queryInputForm` observes it
and cancels immediately if a collision appears.

## Verification boundary

The regression suite renders the real `SceneElementView` with native Arc 22.16.1 `QueryFor.perform`,
replacing only HTTP. It covers drafts, snapshots, validation, retry, exact/missing/ambiguous bindings,
result/not-found, cancellation and stale completion, including the canonical generated ProjectById
shape with Guid descriptors, decorated ProjectSummary, empty-object default and native inherited
`perform`. Native single-result tests and table adapter forwarding tests cover the identity bridge.
These are consumer-shape tests, not execution of a generated application. The DOM environment dispatches the form submit
event; jsdom does not simulate a browser's implicit Enter submission algorithm.

This is a bounded Scene #39 increment, not standalone generated-application/browser acceptance, a Stage
composition change, a general result-binding model or issue closure.
