// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReference } from './TemplateReference';
import { TemplateReferenceKind } from './TemplateReferenceKind';

const identifierPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reads a stored template value.
 *
 * Every level stores a template as one string, and the application's own templates have always been stored
 * by identifier, so that stays: a GUID is an application template and any other value is the name of a
 * template a blueprint package provides. Nothing existing needs migrating, and a blueprint template name
 * is an identifier, never GUID-shaped.
 *
 * @param stored The stored value; empty or missing means nothing is chosen.
 * @returns The reference, or `undefined` when nothing is chosen.
 */
export function parseTemplateReference(stored: string | undefined | null): TemplateReference | undefined {
    const value = stored?.trim() ?? '';
    if (value.length === 0) return undefined;
    return { kind: identifierPattern.test(value) ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint, id: value };
}
