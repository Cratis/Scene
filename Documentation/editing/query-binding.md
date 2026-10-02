---
title: Binding queries
description: Host-supplied query candidates, the QueryBinding value, and how a binding is validated.
---

Scene does not know what queries the application's backend offers. The host does, and tells Scene.

## Candidates

```ts
const candidate: QueryCandidate = {
    id: 'q-invoices-by-customer',            // stable; survives a rename
    name: 'InvoicesForCustomer',             // what the binding registry resolves at runtime
    origin: [                                // path from the editing scope down to the owner
        { kind: 'feature', id: 'f-billing', name: 'Billing' },
        { kind: 'slice', id: 's-invoices', name: 'Invoices' },
    ],
    parameters: [{ name: 'customerId', type: 'Guid', required: true }],
    resultShape: 'collection',               // 'collection' | 'single' | 'optional-single'
    resultFields: [{ name: 'id', type: 'Guid', isIdentity: true }, { name: 'total', type: 'decimal' }],
};
```

Pass the candidates in the editing context as `queryCandidates`.

## The binding

A property of type `queryReference` stores a `QueryBinding`:

```ts
{
    queryId: 'q-invoices-by-customer',
    query: 'InvoicesForCustomer',
    arguments: [{ parameter: 'customerId', source: { path: 'customer.id' } }],
    results: [{ target: 'total', field: 'total' }],
}
```

Every connection is explicit: nothing is matched by name or position. `queryId` is the identity; `query` is
the name captured when the binding was made, and it is what the [binding registry](../components-package/binding-registry.md)
resolves at runtime. `resolveElementBinding` reads the name from either a plain string or a binding.

## Validation

`setProperty` checks a binding against the candidates automatically. To validate directly:

```ts
const diagnostics = validateBinding(descriptor, candidate, binding, { types: { 'customer.id': 'Guid' } });
```

| Code | Reason |
| --- | --- |
| `missingQuery` | The query is not among the candidates |
| `incompatibleResultShape` | The property only binds to some shapes (`constraints.resultShapes`) and this is not one |
| `missingRequiredParameter` | A required parameter has no argument |
| `unknownParameter` | An argument for a parameter the query does not have |
| `argumentTypeMismatch`, `unresolvedArgumentSource` | The source's type does not fit the parameter, or is not in scope. Only checked when a type scope is given |
| `unknownResultField` | A result binding names a field the query does not return |

Types compare by name. A whole number may feed a fractional parameter, never the reverse, and `any` or
`unknown` match anything.
