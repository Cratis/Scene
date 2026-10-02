---
title: Why icon references name a library
description: The reasoning behind library-qualified icon identity, icon libraries as packages, and the absence of precedence between libraries.
---

## Identity is library, key and variant

An `IconReference` is `{ library, key, variant? }`, and equality is all three fields. A display name, a CSS class,
an SVG or a position in a catalog is never identity, because each of them can change without the icon changing -
and each of them is the same across two different icons often enough to matter.

The text form `library#key` or `library#key#variant` exists for keys, logs and diagnostics. It is not the
persisted shape, and it is the same in C# (`IconReference.Format`, `IconReference.TryParse`) and TypeScript
(`formatIconReference`, `parseIconReference`), asserted against one shared fixture file.

## Why libraries are packages

Selecting an icon library in a profile, seeing its version and license, having it pulled in by the components
that need it and getting told when versions disagree are all things a [package](../index.md#packages) already
does. A new `PackageKind.IconLibrary` gets them without a second mechanism, and the only thing specific to icons
is the small `iconLibrary` declaration and the catalog and adapter behind it. Declaring icons as a capability
of an existing kind was rejected because a library is selected, versioned and licensed in its own right, not
as a side effect of a component library.

## Why there is no precedence

Component names resolve by priority: a later package shadows an earlier one. Icons deliberately do not. Two
libraries that both ship `home` are two different icons, and a profile that swaps a library should never
silently change what an existing screen shows. Because the library is part of every reference, no ordering is
needed and none exists; a reference to a library the profile lacks reports `missing-library` rather than
falling back to a similar icon.

## Why the renderer owns the artwork

The model persists only the reference. The catalog is metadata, identical for every renderer. What an icon
looks like on a given platform is the adapter's business, so a library can gain a SwiftUI adapter, or be replaced
by one that has one, without a single stored value changing. No executable markup is ever persisted.
