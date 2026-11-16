// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The size classes a UI profile can assume by default, spelled as the stored profile and the Screenplay `target size` line spell them.
 */
export const profileSizeClasses = ['compact', 'regular', 'expanded'] as const;

/** One of {@link profileSizeClasses}. */
export type ProfileSizeClass = typeof profileSizeClasses[number];

/**
 * Reads a stored size class back, ignoring one this build does not know (written by a newer build) rather than failing to open the profile.
 *
 * @param stored What the application stored; empty or absent for none chosen.
 * @returns The size class, or `undefined` for none.
 */
export function sizeClassOf(stored: string | undefined | null): ProfileSizeClass | undefined {
    return profileSizeClasses.find(candidate => candidate === stored);
}
