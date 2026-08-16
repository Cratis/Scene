---
title: Theme reference
description: The 24 themes the PrimeReact package ships, with their preset family, color scheme, author, source and license.
---

Every theme here is built on one of PrimeTek's `@primeuix/themes` presets, and **none of them are ours**.
`Theme`'s `author`, `authorUrl` and `license` fields exist so that stays visible wherever a theme is
listed — show them in any picker you build.

> [!IMPORTANT]
> **These themes are not MIT.** PrimeReact 10 and its themes were MIT. PrimeReact 11 relicensed the whole
> stack — `primereact`, `@primereact/core`, `@primereact/headless`, `primeicons`, `@primeuix/themes` and
> `@primeuix/styled` — under the commercial **PrimeUI license**, which requires a license key. Without one,
> `PrimeReactProvider` writes a console warning and injects an *"Invalid PrimeUI License"* banner, in
> development **and** production. See [Licensing](#licensing) below.

## Attribution

| Theme | Scheme | Description | Author | Source | License |
| --- | --- | --- | --- | --- | --- |
| `aura-light-blue` | Light | Aura, the flagship PrimeReact 11 design language, in light on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-dark-blue` | Dark | Aura, the flagship PrimeReact 11 design language, in dark on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-light-indigo` | Light | Aura, the flagship PrimeReact 11 design language, in light on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-dark-indigo` | Dark | Aura, the flagship PrimeReact 11 design language, in dark on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-light-purple` | Light | Aura, the flagship PrimeReact 11 design language, in light on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-dark-purple` | Dark | Aura, the flagship PrimeReact 11 design language, in dark on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-light-teal` | Light | Aura, the flagship PrimeReact 11 design language, in light on a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `aura-dark-teal` | Dark | Aura, the flagship PrimeReact 11 design language, in dark on a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-light-blue` | Light | Lara, the roomy family Scene shipped on PrimeReact 10, in light on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-dark-blue` | Dark | Lara, the roomy family Scene shipped on PrimeReact 10, in dark on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-light-indigo` | Light | Lara, the roomy family Scene shipped on PrimeReact 10, in light on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-dark-indigo` | Dark | Lara, the roomy family Scene shipped on PrimeReact 10, in dark on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-light-purple` | Light | Lara, the roomy family Scene shipped on PrimeReact 10, in light on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-dark-purple` | Dark | Lara, the roomy family Scene shipped on PrimeReact 10, in dark on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-light-teal` | Light | Lara, the roomy family Scene shipped on PrimeReact 10, in light on a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `lara-dark-teal` | Dark | Lara, the roomy family Scene shipped on PrimeReact 10, in dark on a teal accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `nora-light-blue` | Light | Nora, a tighter, squarer, more compact family, in light on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `nora-dark-blue` | Dark | Nora, a tighter, squarer, more compact family, in dark on a blue accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `nora-light-indigo` | Light | Nora, a tighter, squarer, more compact family, in light on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `nora-dark-indigo` | Dark | Nora, a tighter, squarer, more compact family, in dark on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `material-light-indigo` | Light | Material, the PrimeTek reading of Material Design, in light on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `material-dark-indigo` | Dark | Material, the PrimeTek reading of Material Design, in dark on an indigo accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `material-light-purple` | Light | Material, the PrimeTek reading of Material Design, in light on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
| `material-dark-purple` | Dark | Material, the PrimeTek reading of Material Design, in dark on a purple accent. | PrimeTek | [primereact.org](https://primereact.org) | PrimeUI Commercial |
## What a Scene theme actually is

A PrimeReact 10 theme was a **file** — a compiled stylesheet under `primereact/resources/themes/<name>/`.
A PrimeReact 11 theme is an **object**: a `@primeuix/themes` preset handed to `PrimeReactProvider`, which
`@primeuix/styled` turns into `--p-*` custom properties at runtime.

So a Scene theme is now a preset family plus an accent:

| Family | Themes | Character |
| --- | --- | --- |
| Aura | 8 | PrimeTek's flagship design language for v11; softer radii, lower-contrast surfaces. |
| Lara | 8 | The family Scene shipped throughout PrimeReact 10 — the closest continuity with a v10 look. |
| Nora | 4 | Tighter spacing, squarer corners, heavier borders. The most compact of the four. |
| Material | 4 | PrimeTek's reading of Material Design; the nearest thing v11 has to the v10 `md-*`/`mdc-*` themes. |

The accent is bound by overriding the preset's `primary` scale with a primitive color ramp the preset
already ships, so `lara-light-teal` is genuinely Lara with Lara's own teal rather than an approximation
mixed by Scene.

## Themes that did not survive the v11 port

PrimeReact 11 ships four preset families. The v10 themes with no counterpart among them are **gone**, not
renamed:

`saga-blue`, `vela-blue`, `arya-blue`, `bootstrap4-light-blue`, `bootstrap4-dark-blue`, `soho-light`,
`soho-dark`, `viva-light`, `viva-dark`, `nano`, `mira`, `fluent-light`, `tailwind-light`.

Renaming a Lara onto `soho-dark` would have kept the catalog's length at the cost of its honesty — the
attribution table above would then have been describing something the theme is not. The closest
replacements are `lara-*` for `saga`/`vela`/`arya`, `material-*` for `md-*`/`mdc-*`, and `nora-*` for
`nano`.

## Where a theme's values come from

The v10 catalog transcribed token values by hand out of each theme's compiled `theme.css` `:root` block.
A v11 preset has no such block: its values are token *references* — `{emerald.500}`,
`light-dark({surface.0}, {surface.900})` — that `@primeuix/styled` resolves at runtime. Transcribing those
by hand would mean re-implementing the resolver in one's head, once per theme.

So the values in `themePresets.ts` are **generated**: each preset is loaded, its `primary` scale bound to
the chosen color ramp, and the thirteen Scene tokens resolved through the same `light-dark()` and `{path}`
rules `@primeuix/styled` applies. What is committed is the output of that resolution, so the catalog stays
plain data a theme picker can read without booting a theme engine — while still agreeing, value for value,
with what the preset actually renders.

A spec (`for_primeReactThemes/when_checking_the_token_vocabulary.ts`) fails the build if any token still
contains an unresolved `{...}` reference or an unpicked `light-dark(...)`, so a resolver that silently gave
up cannot reach the catalog.

## Licensing

PrimeReact 11's `LICENSE.md` states: *"A valid license key is required to use this software. A missing,
invalid, or expired key may cause the software to display a license notice."*

The check runs in `PrimeReactProvider` on mount, with an empty dependency array and **no condition** on
`unstyled`, on `theme`, or on `NODE_ENV`. Every styling path reaches it. Supply your key through the
provider:

```tsx
<PrimeReactProvider value={{ ...configuration, license: 'your-key' }}>
```

- **[Community License](https://primeui.dev/licenses/community)** — free, and covers individuals, students,
  non-profits and non-commercial open source. For organizations it requires *all* of: under $1M USD annual
  gross revenue, fewer than 5 developers, fewer than 10 employees, and under $3M USD in outside funding. It
  supports up to 4 developers and must be renewed annually.
- **[Commercial License](https://primeui.dev/licenses/commercial)** — for everyone else. Per developer,
  perpetual, one year of updates included.

If you publish a library or tool that others build with, read PrimeReact 11's restrictions clause
carefully — *"Redistributing the software so that third parties can develop with it requires a separate OEM
License"* — and check your position with PrimeTek. Nothing here is legal advice; the authoritative terms
are at the links above.
