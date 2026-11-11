---
title: Build an extension component
description: Build the same extension component with React and with mount, and prove both with the conformance kit.
---

This guide builds a greeting component twice, once per kind, and runs both through the [conformance kit](contract.md#conformance-kit). Both take a `label` property and show the user's name and language.

## Declare the component in the contract

The contract in your extension's `contract.play` declares the component, its kind and platforms, its properties and the signals it raises. See the [Screenplay screens page](https://github.com/Cratis/Screenplay/blob/main/Documentation/screenplay/screens.md) for placing it on a screen.

```screenplay
component Greeting
  kind react
  platform web
  property label String
```

## Build it with React

```tsx
import { reactComponent, useLocale, useUser } from '@cratis/scene.extensions';

function GreetingView({ label }: { label: string }) {
    const user = useUser();
    const locale = useLocale();
    return <p>{`${label}|${user.name}|${locale.language}`}</p>;
}

export const Greeting = reactComponent(GreetingView);
```

Read the context through the hooks. The component re-renders when the user or locale changes.

## Build it with mount

```typescript
import { mountComponent } from '@cratis/scene.extensions';

export const Greeting = mountComponent((host, properties, context) => {
    const paragraph = host.ownerDocument.createElement('p');
    let label = String(properties.label);
    const render = () => { paragraph.textContent = `${label}|${context.user.name}|${context.locale.language}`; };

    host.appendChild(paragraph);
    render();
    const unsubscribe = context.subscribe(render);

    return {
        update: next => { label = String(next.label); render(); },
        unmount: () => { unsubscribe(); paragraph.remove(); }
    };
});
```

Subscribe to the context to follow changes, and undo everything in `unmount`. The same body works for Vue, Svelte or Lit: create your app in `host`, pass it `properties` and `context`, and destroy it in `unmount`.

## Prove it with the conformance kit

```typescript
import { createExtensionConformanceChecks } from '@cratis/scene.extensions';

const subject = {
    name: 'Greeting',
    definition: Greeting,
    properties: { label: 'Hello' },
    updatedProperties: { label: 'Welcome' },
    verify: (host, expected) => {
        const wanted = `${expected.properties.label}|${expected.user.name}|${expected.locale.language}`;
        if (host.textContent !== wanted) {
            throw new Error(`Expected '${wanted}' but the host shows '${host.textContent}'.`);
        }
    }
};

describe('Greeting', () => {
    for (const check of createExtensionConformanceChecks(subject)) {
        it(`should ${check.name}`, check.run);
    }
});
```

A mount component that forgets to unsubscribe or to remove its element fails the last two checks. Run it with a DOM environment such as jsdom.

## Host a mount component from React

```tsx
import { MountedComponent } from '@cratis/scene.extensions';

<MountedComponent mount={chartFactory} properties={chartProperties} />
```

## Next steps

- The [contract reference](contract.md) for every member.
- [Stage custom packages](https://github.com/Cratis/Stage/blob/main/Documentation/reference/custom-packages.md) for how a host loads packages.
