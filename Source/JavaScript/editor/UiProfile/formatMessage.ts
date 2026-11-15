// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Fills the `{name}` placeholders of a message.
 *
 * A placeholder with no value is left visible rather than removed, so a missing argument shows up as
 * `{subject}` on screen instead of as a sentence with a silent hole in it.
 *
 * @param template The message, possibly containing `{name}` placeholders.
 * @param values The values to substitute, by placeholder name.
 * @returns The message with every known placeholder replaced.
 */
export function formatMessage(template: string, values: Record<string, string | undefined>): string {
    return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);
}
