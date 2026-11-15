// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReference } from './TemplateReference';

/**
 * The value to store for a reference - the inverse of {@link parseTemplateReference}.
 *
 * @param reference The reference, or `undefined` for nothing chosen.
 * @returns The stored string, empty for nothing chosen.
 */
export function formatTemplateReference(reference: TemplateReference | undefined): string {
    return reference?.id ?? '';
}
