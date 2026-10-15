// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { compareVersions, isValidVersion, isValidVersionRange, isVersionSatisfiedBy } from '../packageVersionRange';

/** Where a blueprint reference's pin stands against what is installed and what is available. */
export enum BlueprintPinStatus {
    /** The installed version satisfies the pin and nothing newer is available. */
    Current = 'Current',

    /** A newer version the pin allows is available: taking it changes nothing the pin promised to keep. */
    UpdateAvailable = 'UpdateAvailable',

    /** A newer version is available that the pin does not allow - usually a new major version - so taking it is a deliberate move that rewrites the pin. */
    UpdateBlockedByPin = 'UpdateBlockedByPin',

    /** The installed version does not satisfy the pin: the reference was chosen from a version that is no longer there. */
    NotSatisfied = 'NotSatisfied',

    /** The pin or a version is not one the engine understands. */
    Invalid = 'Invalid',
}

/** The outcome of evaluating a pin. */
export interface BlueprintPinEvaluation {
    status: BlueprintPinStatus;

    /** The pin that was evaluated: the one given, or the default for the installed version when none was. */
    pin: string;

    /** Said in a sentence, for a tooltip or a diagnostic. */
    message: string;
}

/**
 * The pin a reference gets when a template is chosen from a blueprint: the caret range of the installed version, so the reference accepts
 * every compatible update and refuses a new major version until someone moves it on purpose.
 */
export const defaultBlueprintPin = (installedVersion: string): string => `^${installedVersion}`;

/**
 * Decides whether "update available" applies to a template reference that pins a blueprint version (`TemplateReference.version`).
 *
 * A reference without a pin is held to {@link defaultBlueprintPin} of the installed version. The pin says which versions the reference
 * is content to run against; the installed version must satisfy it, and a newer available version is an update - an ordinary one when
 * the pin allows it, one the pin blocks (usually a major version) when it does not. Both engines implement this identically (`BlueprintVersionPin.Evaluate`) and are
 * asserted against `blueprint-verification-fixtures.json`.
 *
 * @param pin The reference's version range, or undefined when it has none.
 * @param installedVersion The version of the blueprint that is installed.
 * @param latestVersion The newest version of the blueprint that is available; when undefined only the installed version is known.
 */
export function evaluateBlueprintPin(pin: string | undefined, installedVersion: string, latestVersion?: string): BlueprintPinEvaluation {
    const effective = pin === undefined || pin.trim() === '' ? defaultBlueprintPin(installedVersion) : pin.trim();

    if (!isValidVersion(installedVersion)) return { status: BlueprintPinStatus.Invalid, pin: effective, message: `Installed version '${installedVersion}' is not a version` };
    if (!isValidVersionRange(effective)) return { status: BlueprintPinStatus.Invalid, pin: effective, message: `Pin '${effective}' is not a version range` };
    if (latestVersion !== undefined && !isValidVersion(latestVersion)) return { status: BlueprintPinStatus.Invalid, pin: effective, message: `Latest version '${latestVersion}' is not a version` };

    if (!isVersionSatisfiedBy(installedVersion, effective)) {
        return { status: BlueprintPinStatus.NotSatisfied, pin: effective, message: `Version ${installedVersion} is installed but the reference pins ${effective}` };
    }

    if (latestVersion === undefined || compareVersions(latestVersion, installedVersion) <= 0) {
        return { status: BlueprintPinStatus.Current, pin: effective, message: `Version ${installedVersion} is the latest` };
    }

    return isVersionSatisfiedBy(latestVersion, effective)
        ? { status: BlueprintPinStatus.UpdateAvailable, pin: effective, message: `Version ${latestVersion} is available, and ${effective} allows it` }
        : { status: BlueprintPinStatus.UpdateBlockedByPin, pin: effective, message: `Version ${latestVersion} is available but ${effective} does not allow it` };
}
