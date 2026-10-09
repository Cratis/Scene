// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimePropertyDisplayProps } from '@cratis/scene.react';

/** A read-only property display: the severity as a badge rather than the raw enum value. */
export function SeverityBadge({ property, value }: DesignTimePropertyDisplayProps) {
    const choice = property.choices?.find(candidate => candidate.value === value);
    return <span role='status' data-severity={String(value ?? 'unset')}>{choice?.label ?? String(value ?? '—')}</span>;
}
