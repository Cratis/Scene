// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, type RootTemplate } from '@cratis/scene.model';
import { defaultBlueprintPin, evaluateBlueprintPin, type BlueprintPinEvaluation } from '@cratis/scene.engine';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';

/** The ways the version of a blueprint's shell can be held. */
export enum ShellPinKind {
    /** Every compatible update of the installed version, but not a new major one: `^4.5.0`. */
    Follow = 'follow',

    /** Exactly the installed version. */
    Exact = 'exact',

    /** Any version. */
    Latest = 'latest',
}

/** What each way of pinning amounts to for the version installed. */
export function pinsFor(installed: string): Record<ShellPinKind, string> {
    return { [ShellPinKind.Follow]: defaultBlueprintPin(installed), [ShellPinKind.Exact]: installed, [ShellPinKind.Latest]: '*' };
}

/** Which way the pin holds the version, or `undefined` for a range written by hand. */
export function pinKindOf(pin: string | undefined, installed: string): ShellPinKind | undefined {
    const pins = pinsFor(installed);
    if (pin === undefined || pin.trim() === '') return ShellPinKind.Follow;
    return (Object.keys(pins) as ShellPinKind[]).find(kind => pins[kind] === pin.trim());
}

/** Where the pin of the root template stands against the version installed; `undefined` for a root that is not a blueprint's. */
export function evaluatePinOf(root: RootTemplate | undefined, installed: string | undefined): BlueprintPinEvaluation | undefined {
    if (root?.template.source !== TemplateReferenceSource.Blueprint || installed === undefined) return undefined;
    return evaluateBlueprintPin(root.template.version, installed);
}

/**
 * The settings with the root template pinned another way. Nothing but the pin changes: the template, the options and the packages stay.
 *
 * @param settings The current settings.
 * @param kind How to hold the version.
 * @param installed The version of the blueprint that is installed.
 * @returns The settings, or the ones given when the root is not a blueprint's template.
 */
export function withPin(settings: UiProfileSettings, kind: ShellPinKind, installed: string): UiProfileSettings {
    const root = settings.root;
    if (root?.template.source !== TemplateReferenceSource.Blueprint) return settings;
    return { ...settings, root: { ...root, template: { ...root.template, version: pinsFor(installed)[kind] } } };
}
