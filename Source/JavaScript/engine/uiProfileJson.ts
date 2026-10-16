// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ColorScheme,
    ProfileAppearance,
    ProfileDefaults,
    RootTemplate,
    TargetSizeClass,
    TemplateReference,
    TemplateReferenceSource,
    UiProfile,
} from '@cratis/scene.model';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

const referenceOrder = ['source', 'id', 'blueprint', 'version'];

const orderByPath: Record<string, string[]> = {
    '': ['name', 'targetPlatform', 'packages', 'defaultSizeClass', 'layout', 'theme', 'sampleData', 'root', 'appearance', 'defaults'],
    root: ['template', 'options'],
    'root.template': referenceOrder,
    appearance: ['colorScheme', 'accent'],
    defaults: ['newScreenTemplate'],
    'defaults.newScreenTemplate': referenceOrder,
};

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function enumValue<T extends string>(members: Record<string, T>, value: unknown): unknown {
    if (typeof value !== 'string') return value;
    return Object.values(members).find(member => member.toLowerCase() === value.toLowerCase()) ?? value;
}

function readReference(value: unknown): TemplateReference | undefined {
    if (!isObject(value)) return undefined;
    const reference: TemplateReference = {
        source: enumValue(TemplateReferenceSource, value.source) as TemplateReferenceSource,
        id: value.id as string,
    };
    if (value.blueprint !== undefined) reference.blueprint = value.blueprint as string;
    if (value.version !== undefined) reference.version = value.version as string;
    return reference;
}

function readRoot(value: unknown): RootTemplate | undefined {
    if (!isObject(value)) return undefined;
    const root: RootTemplate = { template: readReference(value.template) as TemplateReference };
    if (isObject(value.options)) root.options = value.options;
    return root;
}

function readAppearance(value: unknown): ProfileAppearance | undefined {
    if (!isObject(value)) return undefined;
    const appearance: ProfileAppearance = {};
    if (value.colorScheme !== undefined) appearance.colorScheme = enumValue(ColorScheme, value.colorScheme) as ColorScheme;
    if (value.accent !== undefined) appearance.accent = value.accent as string;
    return appearance;
}

function readDefaults(value: unknown): ProfileDefaults | undefined {
    if (!isObject(value)) return undefined;
    const defaults: ProfileDefaults = {};
    const newScreenTemplate = readReference(value.newScreenTemplate);
    if (newScreenTemplate) defaults.newScreenTemplate = newScreenTemplate;
    return defaults;
}

function canonicalize(value: Json, path: string): Json {
    if (Array.isArray(value)) return value.map(item => canonicalize(item, `${path}[]`));
    if (!isObject(value)) return value;

    const keys = Object.keys(value).filter(key => value[key] !== undefined);
    const order = orderByPath[path];
    const ordered = order
        ? [...order.filter(key => keys.includes(key)), ...keys.filter(key => !order.includes(key)).sort()]
        : [...keys].sort();

    const result: JsonObject = {};
    for (const key of ordered) {
        result[key] = canonicalize(value[key], path.length === 0 ? key : `${path}.${key}`);
    }
    return result;
}

/**
 * Reads a {@link UiProfile} from JSON. Reading is lenient, exactly like the C# `UiProfileJson.Parse`: enum values are matched
 * case-insensitively, unknown members of the profile, its root template, template references, appearance and defaults are ignored,
 * and any member may be absent - so a profile written before `root`, `appearance` and `defaults` existed loads unchanged.
 *
 * @param json The JSON text of a profile, or an already parsed value.
 * @returns The profile.
 */
export function parseUiProfile(json: string | unknown): UiProfile {
    const value = typeof json === 'string' ? (JSON.parse(json) as unknown) : json;
    if (!isObject(value)) throw new Error('A UI profile must be a JSON object.');

    const profile: UiProfile = {
        name: value.name as string,
        targetPlatform: value.targetPlatform as string,
        packages: value.packages as string[],
    };
    if (value.defaultSizeClass !== undefined) profile.defaultSizeClass = enumValue(TargetSizeClass, value.defaultSizeClass) as TargetSizeClass;
    if (value.layout !== undefined) profile.layout = value.layout as string;
    if (value.theme !== undefined) profile.theme = value.theme as string;
    if (value.sampleData !== undefined) profile.sampleData = value.sampleData as unknown as UiProfile['sampleData'];
    const root = readRoot(value.root);
    if (root) profile.root = root;
    const appearance = readAppearance(value.appearance);
    if (appearance) profile.appearance = appearance;
    const defaults = readDefaults(value.defaults);
    if (defaults) profile.defaults = defaults;
    return profile;
}

/**
 * Writes a {@link UiProfile} as canonical JSON, byte for byte what the C# `UiProfileJson.Serialize` writes: camelCase names, enum
 * values by declared name, absent members omitted, no whitespace. Key order is the model's declaration order for the profile, its root
 * template, template references, appearance and defaults, and ordinal order everywhere else (sample data, shell options).
 *
 * @param profile The profile to write.
 * @returns The canonical JSON text.
 */
export function serializeUiProfile(profile: UiProfile): string {
    return JSON.stringify(canonicalize(profile as unknown as Json, ''));
}
