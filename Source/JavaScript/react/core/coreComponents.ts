// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry } from '../renderer';
import { componentRegistryKey } from '../packages';
import { CoreText } from './CoreText';
import { CoreButton } from './CoreButton';
import { CoreCard } from './CoreCard';

/**
 * The `core` package's component registry - the final fallback every `ui profile` resolves against
 * regardless of which other packages it lists (Scene#3).
 */
export const coreComponents: ComponentRegistry = {
    [componentRegistryKey('core', 'text')]: CoreText,
    [componentRegistryKey('core', 'button')]: CoreButton,
    [componentRegistryKey('core', 'card')]: CoreCard,
};
