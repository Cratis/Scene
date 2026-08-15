// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SizeClass, UiProfile, UiStarter } from '@cratis/scene.model';

/**
 * Builds the sandboxed {@link UiProfile} a {@link UiStarter}'s gallery boots through - part of
 * Cratis/Scene#6. Studio runs a starter's gallery screens as a working mini-app rather than a simulated
 * preview, so the gallery needs a real profile scoped to exactly the starter's own package list, not the
 * consuming project's eventual profile. Studio's design-time tooling and Stage's build-time resolution
 * use the C# twin of this function in `Cratis.Scene.Engine`; both sides are asserted against the same
 * shared fixture corpus so they cannot drift apart.
 *
 * @param starter The {@link UiStarter} to build the profile for.
 * @param targetPlatform The platform the gallery runs on (e.g. `web`).
 * @param defaultSizeClass The size class assumed when the renderer cannot otherwise determine one.
 * @returns A {@link UiProfile} named after the starter, scoped to exactly its own `packages`.
 */
export function buildStarterProfile(starter: UiStarter, targetPlatform: string, defaultSizeClass?: SizeClass): UiProfile {
    return { name: starter.name, targetPlatform, packages: starter.packages, defaultSizeClass };
}
