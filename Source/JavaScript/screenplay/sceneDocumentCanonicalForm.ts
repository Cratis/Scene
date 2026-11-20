// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { bindingKinds, enumerationIndexOf, enumerationsByMember } from './sceneEnumerations';
import { elementFrameDefaults } from './sceneElementFrame';
import type { JsonObject, JsonValue } from './json';
import { studioLayoutName } from './sceneScreens';

// The mirror of SceneDocumentCanonicalForm: the meaning of a Scene document with everything that does not change
// it taken out - members at the editor's defaults, empty collections, the data-context binding kind, enumeration
// spellings, member order. Two documents that say the same have the same canonical form, so a comparison does not
// fail on how one of them happened to be written.
export const canonicalFormOf = (document: string | JsonValue | undefined): string => {
    const parsed = typeof document === 'string' ? parse(document) : document;
    const normalized = normalize(parsed, undefined);
    return normalized === undefined ? 'null' : JSON.stringify(normalized);
};

export const areRenderEquivalent = (first: string | JsonValue, second: string | JsonValue): boolean =>
    canonicalFormOf(withoutNative(first)) === canonicalFormOf(withoutNative(second));

// The document without the native residue: the printed .play text the C# bridge keeps so an exact document can be
// written back out. It changes nothing a host draws, and only the C# bridge can produce it, so a comparison of
// what two bridges draw leaves it out.
export const withoutNative = (document: string | JsonValue): JsonValue | undefined => {
    const parsed = typeof document === 'string' ? parse(document) : document;
    return strip(parsed);
};

// The member the C# bridge keeps its printed .play residue under.
const nativeMember = 'native';

const strip = (value: JsonValue | undefined): JsonValue | undefined => {
    if (Array.isArray(value)) return value.map(item => strip(item) ?? null);
    if (typeof value !== 'object' || value === null) return value;
    const result: JsonObject = {};
    for (const [member, item] of Object.entries(value)) {
        if (member === nativeMember) continue;
        const stripped = strip(item);
        if (stripped !== undefined) result[member] = stripped;
    }
    return result;
};

const parse = (document: string): JsonValue | undefined => {
    try {
        return JSON.parse(document) as JsonValue;
    } catch {
        return undefined;
    }
};

const normalize = (node: JsonValue | undefined, member: string | undefined): JsonValue | undefined => {
    if (node === null || node === undefined) return undefined;
    if (Array.isArray(node)) return normalizeArray(node, member);
    if (typeof node === 'object') return normalizeObject(node, member);
    return node;
};

const normalizeObject = (json: JsonObject, owner: string | undefined): JsonObject => {
    const defaults = elementFrameDefaults();
    const binding = isBinding(json);
    const result: JsonObject = {};
    for (const key of Object.keys(json).sort()) {
        const normalized = normalizeMember(key, json[key], binding);
        if (normalized === undefined || isEmpty(normalized) || isDefault(key, normalized, defaults, binding, owner)) continue;
        result[key] = normalized;
    }
    return result;
};

const normalizeMember = (key: string, value: JsonValue, binding: boolean): JsonValue | undefined => {
    if (key === 'kind' && binding) return enumeration(value, bindingKinds);
    const names = enumerationsByMember[key];
    if (names !== undefined) return enumeration(value, names);
    return normalize(value, key);
};

const enumeration = (value: JsonValue, names: readonly string[]): JsonValue | undefined => {
    const index = enumerationIndexOf(value, names);
    return index === undefined ? normalize(value, undefined) : names[index].toLowerCase();
};

const normalizeArray = (array: JsonValue[], member: string | undefined): JsonValue[] | undefined => {
    if (member === 'layouts' && array.length === 1 && canonicalFormOf(array[0]) === canonicalFormOf(studioLayout())) return undefined;
    return array.map(item => normalize(item, member) ?? null);
};

const studioLayout = (): JsonObject => ({ name: studioLayoutName, slots: [{ name: 'content' }] });

const isBinding = (json: JsonObject): boolean => typeof json.path === 'string';

const isEmpty = (value: JsonValue): boolean =>
    value === null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

const isDefault = (key: string, value: JsonValue, defaults: JsonObject, binding: boolean, owner: string | undefined): boolean => {
    if (binding && key === 'kind' && typeof value === 'string' && value.toLowerCase() === bindingKinds[0].toLowerCase()) return true;
    if (owner === 'screens' && key === 'layout' && value === studioLayoutName) return true;
    const fallback = defaults[key];
    if (fallback === undefined) return false;
    return JSON.stringify(normalize(fallback, key) ?? null) === JSON.stringify(value);
};
