// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Fills the `{name}` placeholders of one of the editor's strings.
 *
 * @param template The string, with `{name}` where a value goes.
 * @param values The value of each name. A name the string does not mention is ignored; one it mentions that has no value stays as written.
 * @returns The string with the values in.
 */
export const fill = (template: string, values: Readonly<Record<string, string | number>>): string =>
    template.replace(/\{(\w+)\}/g, (placeholder, name: string) => name in values ? String(values[name]) : placeholder);
