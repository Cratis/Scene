// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { isContentControl, isExternalComponent, isItemsControl, isPanel } from './elementKind';

/**
 * A locale's flat key -> value table, as `.strings` files parse to: dotted keys such as `invoice.title`
 * mapped to their localized text.
 */
export type StringsDictionary = Record<string, string>;

const referencePrefix = '$strings.';

/**
 * Whether a property value is a `$strings.<key>` reference rather than a literal value.
 *
 * A document prints `$strings.<key>` unquoted - see Screenplay's internationalization documentation - so
 * the reference survives into a compiled element's properties as this exact string shape, indistinguishable
 * from any other string property until something resolves it.
 */
export function isStringsReference(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith(referencePrefix);
}

/**
 * Resolves a single property value against a locale's dictionary.
 *
 * A value that is not a `$strings.` reference passes through unchanged - resolving is a no-op on anything
 * else a screen might put in the same property. A reference whose key is missing from the dictionary is
 * left as the literal `$strings.<key>` text rather than blanked out - the same failure mode the frontend
 * already had before resolution existed, and one an author notices immediately rather than a silently
 * empty label.
 */
export function resolveStringsValue(value: unknown, dictionary: StringsDictionary): unknown {
    if (!isStringsReference(value)) {
        return value;
    }

    const key = value.slice(referencePrefix.length);
    return Object.hasOwn(dictionary, key) ? dictionary[key] : value;
}

/**
 * Resolves every `$strings.` reference in an element tree's `properties` against a locale's dictionary,
 * returning a new tree - the input is never mutated, so a caller holding the original (a cached scene,
 * a Studio design-time fixture) keeps seeing the unresolved symbolic form.
 *
 * Walks every shape an element tree actually nests content in: an `ExternalComponent`'s named `slots`, a
 * `ContentControl`'s single `content`, an `ItemsControl`'s `itemTemplate`, and a `Panel`'s `children`. This
 * is the same set {@link isExternalComponent}/{@link isContentControl}/{@link isItemsControl}/{@link isPanel}
 * already distinguish elsewhere in this package, so a new element kind that starts nesting content a new
 * way needs a matching type guard there before it can be walked here too.
 */
export function resolveStringsInElement(element: SceneElement, dictionary: StringsDictionary): SceneElement {
    const properties = Object.fromEntries(
        Object.entries(element.properties ?? {}).map(([key, value]) => [key, resolveStringsValue(value, dictionary)]),
    );

    const resolved: SceneElement = { ...element, properties };

    if (isExternalComponent(resolved)) {
        resolved.slots = Object.fromEntries(
            Object.entries(resolved.slots ?? {}).map(([slotName, children]) => [
                slotName,
                children.map(child => resolveStringsInElement(child, dictionary)),
            ]),
        );
    }

    if (isContentControl(resolved) && resolved.content) {
        resolved.content = resolveStringsInElement(resolved.content, dictionary);
    }

    if (isItemsControl(resolved) && resolved.itemTemplate) {
        resolved.itemTemplate = resolveStringsInElement(resolved.itemTemplate, dictionary);
    }

    if (isPanel(resolved)) {
        resolved.children = resolved.children.map(child => resolveStringsInElement(child, dictionary));
    }

    return resolved;
}
