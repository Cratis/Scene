// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Fills the `{name}` placeholders of a label.
 *
 * @param template The label.
 * @param values What each placeholder stands for.
 * @returns The label with the values in.
 */
export function formatGalleryMessage(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => (key in values ? String(values[key]) : placeholder));
}
