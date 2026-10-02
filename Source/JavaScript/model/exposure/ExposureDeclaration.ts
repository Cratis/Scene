// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExposedProperty } from './ExposedProperty';

/**
 * Everything one layout or template exposes to whatever sits inside it.
 */
export interface ExposureDeclaration {
    /** The name of the layout, screen template or dialog template making the declaration. */
    owner: string;

    properties: ExposedProperty[];
}

export const ExposureDeclarationPropertyNames: (keyof ExposureDeclaration)[] = ['owner', 'properties'];
