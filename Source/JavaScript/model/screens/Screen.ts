// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '../elements';
import { Form } from '../forms';
import { Contribution } from '../contributionPoints';

/**
 * A named screen: a layout, the content that fills its slots, the forms it hosts, and whatever it
 * contributes to contribution points elsewhere in the tree.
 */
export interface Screen {
    name: string;
    layout: string;
    slotContent: Record<string, SceneElement[]>;
    forms: Form[];
    contributions: Contribution[];
}

export const ScreenPropertyNames: (keyof Screen)[] = ['name', 'layout', 'slotContent', 'forms', 'contributions'];
