// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor } from '@cratis/scene.model';

/**
 * Finds sample-row literals inside a value: an array holding plain objects of two or more keys, which is what
 * a hand-written list of demo rows looks like. Returns the path of each, e.g. `rows` or `items[2].children`.
 * A single-key object is a choice or a token, not a row, and is not reported.
 *
 * Spec §11 SD1: components keep declaring shapes only, so a component descriptor's defaults and a template's
 * properties must not carry row literals; demo rows belong to sample-data packs.
 *
 * @param value The value to inspect.
 * @param path The path prefix of the value, empty for the root.
 */
export function findSampleRowLiterals(value: unknown, path = ''): string[] {
    const found: string[] = [];
    if (Array.isArray(value)) {
        if (value.some(isRow)) found.push(path === '' ? '(root)' : path);
        value.forEach((item, index) => found.push(...findSampleRowLiterals(item, `${path}[${index}]`)));
    } else if (typeof value === 'object' && value !== null) {
        for (const [key, child] of Object.entries(value)) {
            found.push(...findSampleRowLiterals(child, path === '' ? key : `${path}.${key}`));
        }
    }

    return found;
}

/**
 * Finds the sample-row literals in the defaults of component descriptors, as `<component>: <property path>`
 * entries (the property path is followed by the location inside the default).
 *
 * @param descriptors The descriptors to inspect.
 */
export function findDescriptorSampleRowLiterals(descriptors: readonly ComponentDescriptor[]): string[] {
    const found: string[] = [];
    for (const descriptor of descriptors) {
        for (const property of descriptor.properties ?? []) {
            for (const location of findSampleRowLiterals(property.default)) {
                const suffix = location === '(root)' ? '' : (location.startsWith('[') ? location : `.${location}`);
                found.push(`${descriptor.component}: ${property.path}${suffix}`);
            }
        }
    }

    return found;
}

function isRow(item: unknown): boolean {
    return typeof item === 'object' && item !== null && !Array.isArray(item) && Object.keys(item).length >= 2;
}

/** The part of a scene element the scan reads: its properties and the child elements in its slots. */
interface ScannedElement {
    componentName?: string;
    properties?: Record<string, unknown>;
    slots?: Record<string, ScannedElement[]>;
}

/**
 * Finds the sample-row literals in the element properties of a template's content, as
 * `<componentName>.<property>` entries (with the location inside the value when it is nested). Only property
 * values are scanned: the element tree itself is made of objects and is not data.
 *
 * @param content A template's content, keyed by slot name.
 */
export function findTemplateSampleRowLiterals(content: Record<string, ScannedElement[]> | undefined): string[] {
    const found: string[] = [];
    const visit = (elements: ScannedElement[] | undefined) => {
        for (const element of elements ?? []) {
            for (const [name, value] of Object.entries(element.properties ?? {})) {
                for (const location of findSampleRowLiterals(value)) {
                    const suffix = location === '(root)' ? '' : (location.startsWith('[') ? location : `.${location}`);
                    found.push(`${element.componentName ?? '(unnamed)'}.${name}${suffix}`);
                }
            }

            Object.values(element.slots ?? {}).forEach(visit);
        }
    };

    Object.values(content ?? {}).forEach(visit);
    return found;
}
