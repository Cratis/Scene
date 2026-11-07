// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import { SlotShapeDiagnostic } from './SlotShapeDiagnostic';
import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The property an `action` component stored its presentation in, before Scene 5 replaced it with `opens`. */
export const legacyActionPresentationProperty = 'presentation';

/** What each presentation an `action` component stored becomes as `opens`. */
const presentationToOpens: Record<string, Opens> = {
    none: Opens.None,
    modal: Opens.Dialog,
    drawer: Opens.Drawer,
};

/** What the validator tells a document whose `action` component still stores a presentation. */
export const actionPresentationMigrationHint = 'Scene 5 replaced an action\'s presentation with opens: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source';

/**
 * Whether an object is an `action` component - any package's `<package>:action` - that stores the presentation Scene 5
 * replaced with `opens`.
 * @param value The object.
 * @returns Whether it stores a legacy presentation.
 */
export function isLegacyActionPresentation(value: JsonObject): boolean {
    return typeof value.componentName === 'string'
        && value.componentName.endsWith(':action')
        && isObject(value.properties)
        && legacyActionPresentationProperty in value.properties;
}

/**
 * Turns an `action` component's stored presentation into `opens`: `none` runs directly (`none`), `modal` asks in a
 * dialog (`dialog`) and `drawer` in a drawer (`drawer`), in any letter case. A presentation of another value, or one
 * next to an `opens` that says otherwise, is reported and left as it was.
 * @param owner The object, which is changed in place.
 * @param path The JSON path of the object.
 * @param diagnostics Where what cannot be mapped is reported.
 * @returns Whether the object changed.
 */
export function upgradeActionPresentation(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): boolean {
    if (!isLegacyActionPresentation(owner)) return false;

    const properties = owner.properties as JsonObject;
    const presentation = properties[legacyActionPresentationProperty];
    const opens = typeof presentation === 'string' ? presentationToOpens[presentation.toLowerCase()] : undefined;
    const propertyPath = `${path}.properties.${legacyActionPresentationProperty}`;
    if (opens === undefined) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyActionPresentation,
            path: propertyPath,
            message: `The action '${String(owner.id)}' is presented as '${String(presentation)}', which is not none, modal or drawer, so it has no opens to become`,
        });
        return false;
    }

    if (properties.opens !== undefined && properties.opens !== opens) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyActionPresentation,
            path: propertyPath,
            message: `The action '${String(owner.id)}' is presented as '${String(presentation)}' but opens '${String(properties.opens)}'; keep one`,
        });
        return false;
    }

    const upgraded: JsonObject = {};
    for (const [key, value] of Object.entries(properties)) {
        if (key === legacyActionPresentationProperty) upgraded.opens = opens;
        else if (key !== 'opens') upgraded[key] = value;
    }
    owner.properties = upgraded;
    return true;
}
