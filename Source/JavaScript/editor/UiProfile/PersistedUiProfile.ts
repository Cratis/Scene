// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A UI profile as it is stored: plain strings, so the host's generated proxy class satisfies it
 * structurally without this package knowing about the host.
 *
 * It carries the resolved package order and the shell's layout as well as the choices, so a consumer that
 * has no package catalog - Play, for one - can still build a Scene `UiProfile` from it.
 */
export interface PersistedUiProfile {
    packages: string[];
    shell: string;
    templatePacks: string[];
    resolvedPackages: string[];
    layout: string;
    theme: string;
    colorScheme: string;
    navigationMode: string;
    accent: string;
    defaultScreenTemplate: string;
}
