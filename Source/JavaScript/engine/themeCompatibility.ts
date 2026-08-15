// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile } from '@cratis/scene.model';

/**
 * Finds the packages a {@link UiProfile} declares that a {@link Theme} is not declared compatible with -
 * part of Cratis/Scene#5, the same rule Screenplay's compiler already applies to warn on an incompatible
 * `ui profile`/`theme` pairing, reused here so `Scene.React` knows which packages to actually apply a
 * theme's tokens to, and so Studio's design-time tooling and Stage's build-time checks don't each
 * reimplement it. There is deliberately no implicit exemption for `core`: a theme wanting broad
 * applicability declares `compatible with core` itself, exactly like the profile/package resolver has no
 * implicit special case for it either.
 *
 * @param theme The {@link Theme} to check.
 * @param profile The {@link UiProfile} whose packages to check against.
 * @returns The packages in `profile.packages` that `theme` does not declare compatibility with.
 */
export function incompatiblePackages(theme: Theme, profile: UiProfile): string[] {
    return profile.packages.filter(package_ => !theme.compatibleWith.includes(package_));
}

/**
 * Whether a {@link Theme} is compatible with every package a {@link UiProfile} declares.
 *
 * @param theme The {@link Theme} to check.
 * @param profile The {@link UiProfile} whose packages to check against.
 * @returns `true` when `theme` declares compatibility with every package `profile` lists.
 */
export function isThemeCompatible(theme: Theme, profile: UiProfile): boolean {
    return incompatiblePackages(theme, profile).length === 0;
}

/**
 * Finds the packages a {@link Theme}'s tokens actually apply to for a given {@link UiProfile} - the
 * packages the profile activates that the theme also declares compatibility with. This is what a
 * renderer scopes token application to, rather than applying a theme's tokens globally - and is
 * recomputed on every theme switch for the live re-resolution Cratis/Scene#5 requires (no reload).
 *
 * @param theme The {@link Theme} to apply.
 * @param profile The active {@link UiProfile}.
 * @returns The packages both active in `profile` and declared compatible by `theme`.
 */
export function applicableThemePackages(theme: Theme, profile: UiProfile): string[] {
    return profile.packages.filter(package_ => theme.compatibleWith.includes(package_));
}
