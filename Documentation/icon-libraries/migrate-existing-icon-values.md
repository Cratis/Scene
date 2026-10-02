---
title: Migrate existing icon values
description: What happens to bare icon strings such as pi pi-home, and how to preview the effect of removing or upgrading an icon library on stored references.
---

## Existing string icons keep working

Before icon libraries, an icon was a bare string - an icon font class such as `pi pi-home`, as in the default
blueprint's navigation entries and shell menu items. Those values are **left as they are**. Nothing in Scene
rewrites them, and a renderer that reads them as a class keeps drawing them.

A string has no library, so it cannot be turned into an `IconReference` without choosing one, and the choice
can be a real one: two libraries may both have `home`. Migration is therefore the author's decision, one value
at a time, never a blanket rewrite.

`isIconReference` tells the two forms apart when a value could be either:

```ts
import { IconReference, isIconReference } from '@cratis/scene.model';

function render(icon: string | IconReference) {
    return isIconReference(icon) ? drawReference(icon) : drawLegacyClass(icon);
}
```

## Find the candidates for a string

`findByName` returns every active library's icon whose name or key equals the string - all of them, not a
winner:

```ts
const candidates = await icons.findByName('home');
// [{ library: lucide, entry: house... }, { library: prime, entry: home... }]
```

An author, or a tool such as Studio, picks one and stores its `reference`.

## Preview the impact of a library change

`analyzeIconImpact` compares the catalog a profile has now with the catalog it would have after a change - a
library removed, a version upgraded, a library swapped - and reports which stored values would stop resolving.
It never modifies them.

```ts
import { analyzeIconImpact, resolveIconLibraries, EffectiveIconCatalog } from '@cratis/scene.engine';

const current = new EffectiveIconCatalog(resolveIconLibraries(profile.packages, catalog), sources);
const proposed = new EffectiveIconCatalog(resolveIconLibraries(packagesAfterChange, catalogAfterChange), sourcesAfterChange);

const report = await analyzeIconImpact(
    [
        { value: { library: '@acme/scene.icons.lucide', key: 'house' }, location: 'shell/menu' },
        { value: 'pi pi-home', location: 'legacy/menu' },
    ],
    current,
    proposed
);
```

| Report field | Meaning |
| --- | --- |
| `affected` | References that do not resolve after the change, each with the diagnostic that says why and `wasResolvable`, which separates new damage from references that were already broken. |
| `unaffectedCount` | How many references still resolve. |
| `legacy` | Bare strings, untouched, each with the icons in the proposed catalog it could be migrated to. |

Use the report to decide - to keep the library, to pick replacement references, or to proceed knowing which
locations will lose their icon.
