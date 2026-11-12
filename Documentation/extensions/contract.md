---
title: Extension component contract
description: Reference for @cratis/scene.extensions - the component kinds, the ExtensionContext, the use* hooks, slot composition, manifest types and the conformance kit.
---

`@cratis/scene.extensions` is the one contract every extension frontend implements and every host (Stage, Studio, previews) supports. An extension can be built with React, Vue, Svelte, Lit, web components or plain DOM; the contract makes them look and behave the same. The design is decision 0159 in the [Screenplay decisions](https://github.com/Cratis/Screenplay/blob/main/decisions/0159-systems-with-abilities-extensions-and-durable-invocations.md). To build one, see [Build an extension component](build-a-component.md).

```bash
npm install @cratis/scene.extensions
```

React and React DOM are peer dependencies, needed only by the React parts of the package.

## Component kinds

A component declares its kind in the package manifest. All kinds receive typed properties and the same context, and raise signals through the context.

| Kind | What you write | Rendered |
| --- | --- | --- |
| `react` | A React component, wrapped with `reactComponent(Component)` | In the host's own React tree, sharing the host's React through Stage's import map. Web only. |
| `mount` | `mountComponent((host, properties, context) => ({ update, unmount }))` | Into a host element you are given. The framework-neutral floor. |
| `screenplay` | A template in the package | By the renderer, with the same properties and context. Nothing to implement here. |

```typescript
import { mountComponent, reactComponent } from '@cratis/scene.extensions';

export const PaymentForm = reactComponent(PaymentFormView);
export const Chart = mountComponent((host, properties, context) => { /* ... */ }, ['web', 'desktop']);
```

`reactComponent` always declares `['web']`. `mountComponent` takes the platforms it supports and defaults to `['web']`; an empty list throws. A frontend module exports its components by the name the contract declares (`ExtensionFrontendModule`).

A mounted component answers with a `MountedInstance`:

| Member | Meaning |
| --- | --- |
| `update(properties)` | Called whenever a bound property changes. |
| `unmount()` | Remove everything you put on the page and release every subscription. |

## ExtensionContext

| Member | Meaning |
| --- | --- |
| `user` | `id`, `name`, `roles`, `signedIn`. |
| `tenant` | `id`, and `name` when known. |
| `locale` | `language`, `availableLanguages`, `timeZone`. |
| `theme` | `colorScheme` (`light` or `dark`) and `tokens`. Style from the tokens; do not hard-code colors. |
| `settings` | The system's **public** settings. Secret settings never reach the browser. |
| `strings` | The system's strings for the active language. |
| `invoke(ability, inputs?)` | Request and response through the host. The host applies the contract's `invokes` allowlist and the screen's authorization. |
| `raise(signal, values?)` | Raises a signal the contract declares; the screen's `on <signal>` handles it. |
| `on(trigger, handler)` | Subscribes to one of the extension's triggers. Returns a disposer. |
| `subscribe(listener)` | Calls the listener with the changed part name (`user`, `tenant`, `locale`, `theme`, `settings`, `strings`). Returns a disposer. |
| `version` | Increases by one on every change. |
| `renderSlot(host, slotName)` | Renders Scene content into `host`. Returns a disposer. |

Reading a part always returns the current value, and a part keeps its identity until it changes, so `context.user === previousUser` means nothing changed.

### Creating a context

Hosts, previews and specs build a context with `createExtensionContext`, which also returns the controller that changes it:

```typescript
const controller = createExtensionContext({
    user: { id: 'u1', name: 'Ada', roles: [], signedIn: true },
    invoke: async (ability, inputs) => ({ ok: true }),
    raise: (signal, values) => deliverToScreen(signal, values)
});

controller.update({ locale: { language: 'nb', availableLanguages: ['en', 'nb'], timeZone: 'Europe/Oslo' } });
controller.trigger('PaymentSucceeded', { paymentIntentId: 'pi_1' });
controller.subscriberCount; // 0 when every component cleaned up
```

Without a host `invoke` the context rejects, so a missing service is loud. Without a host `renderSlot` it renders an empty element marked `data-extension-slot`.

## React hooks

All hooks need an `ExtensionContextProvider` above them; without one they throw `No extension context`. The host renders the provider around every component it mounts.

| Hook | Returns | Re-renders when |
| --- | --- | --- |
| `useExtensionContext()` | The whole context | Any part changes. |
| `useUser()` | `ExtensionUser` | The user changes. |
| `useTenant()` | `ExtensionTenant` | The tenant changes. |
| `useLocale()` | `ExtensionLocale` | The locale changes. |
| `useTheme()` | `ExtensionTheme` | The theme changes. |
| `useSettings()` | `ExtensionSettings` | Settings change. |
| `useStrings()` | `(key) => string`, the key itself when there is no string | Strings change. |
| `useInvoke()` | `invoke` | Never; stable for the life of the context. |
| `useRaise()` | `raise` | Never; stable for the life of the context. |
| `useTrigger(trigger, handler)` | Nothing | Never; subscribes while mounted, using the latest handler. |

Prefer a focused hook to `useExtensionContext()`: it re-renders only when its own part changes.

## Composition

**A React component hosting a mount component**: render `<MountedComponent mount={factory} properties={...} className? />`. It mounts once with the ambient context, calls `update` when `properties` changes (keep the object stable between renders), and calls `unmount` on removal.

**A mount component hosting Scene content**: call `context.renderSlot(host, slotName)` and call the returned function on `unmount`.

**A React component hosting Scene content**: render `<ExtensionSlot name="toolbar" />`.

**A host mounting either kind**: `mountExtensionComponent(definition, host, properties, context)` gives both kinds the same contract and returns a `MountedInstance`. A React component gets its own React root inside the provider; a host that renders React components in its own tree renders `ExtensionContextProvider` and the component directly.

## Frontend manifest types

The frontend part of an extension's `contract.play` is described by these types: `ExtensionFrontendManifest`, `ExtensionComponentManifest` (`name`, `kind`, `platforms`, `placeholder`, `properties`, `raises`), `ExtensionValueManifest` and `ExtensionSignalManifest`.

`validateFrontendManifest(manifest)` answers every problem as a sentence: duplicate component names, a component with no platform, and a React component that declares anything but `web`. `findExtensionComponent` and `supportsPlatform` look a component up and check a platform.

## Resolving components in a UI profile

The Scene engine resolves extension components with the same package order as runtime packages. `resolveExtensionComponent(name, profile, runtimeCatalog, extensions, platform?)` in `@cratis/scene.engine` returns the resolved package (with what it shadowed), the extension's declaration and whether it supports the platform. A package-qualified name such as `Stripe.PaymentForm` resolves directly against its package. See [Naming and shadowing](../components-package/naming-and-shadowing.md).

## Conformance kit

`createExtensionConformanceChecks(subject)` returns the expectations every component meets, run identically for either kind. It needs a DOM (jsdom is fine) and works with any runner:

```typescript
for (const check of createExtensionConformanceChecks(subject)) {
    it(`should ${check.name}`, check.run);
}
```

The subject supplies the definition, the properties it mounts with, different properties for the update check and a `verify(host, expected)` that throws when the host does not show the expected properties, user name and language. The checks:

- Declares at least one platform, and a React component only the web.
- Shows its properties, the user and the locale after mounting.
- Shows new property values after an update.
- Follows the user and the locale when the context changes.
- Removes what it rendered when unmounted.
- Releases every subscription when unmounted.

## Related documentation

- [Screenplay screens](https://github.com/Cratis/Screenplay/blob/main/Documentation/screenplay/screens.md): placing a component on a screen.
- [Stage custom packages](https://github.com/Cratis/Stage/blob/main/Documentation/reference/custom-packages.md): how Stage loads packages at runtime. Hosting extension components is tracked in [Cratis/Stage#1070](https://github.com/Cratis/Stage/issues/1070) and the language support in [Cratis/Screenplay#1255](https://github.com/Cratis/Screenplay/issues/1255).

## Binding a raised signal to a screen interaction

A screen handles a signal with `on <signal>`. Scene models that binding as a `SignalInteractionTrigger`, which carries only the `signalName` as the component's contract declares it (`@cratis/scene.model`, `Cratis.Scene.Model.Interactions`). It serializes as `{ "signalName": "succeeded" }` in an interaction binding's `trigger`, next to `kind`, `eventName`, `seconds` and `triggerName` triggers; the other trigger kinds are unchanged.

When a component raises a signal, the host collects the behaviors attached to that component and resolves them with `resolveSignalBehaviors(attachments, signalName)` from `@cratis/scene.engine`. The result is in the same deterministic order as other triggers. A signal trigger never matches an application trigger of the same name, and the reverse.
