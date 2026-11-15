// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { humanizeBindingName } from '@cratis/scene.blueprint.components';

export function previewActionLabel(properties: Record<string, unknown>): string {
    if (typeof properties.label === 'string') return properties.label;
    return humanizeBindingName(typeof properties.command === 'string' ? properties.command : '');
}
