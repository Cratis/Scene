// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry } from '../renderer';
import { componentRegistryKey } from '../packages';
import { CoreText } from './CoreText';
import { CoreButton } from './CoreButton';
import { CoreCard } from './CoreCard';
import {
    CoreAction,
    CoreCode,
    CoreColumn,
    CoreData,
    CoreField,
    CoreFile,
    CoreNavigate,
    CoreSection,
    CoreSummary,
    CoreTable,
    CoreTitle,
} from './ScreenplayCoreComponents';

/**
 * The `core` package's component registry - the final fallback every `ui profile` resolves against
 * regardless of which other packages it lists (Scene#3).
 */
export const coreComponents: ComponentRegistry = {
    [componentRegistryKey('core', 'text')]: CoreText,
    [componentRegistryKey('core', 'button')]: CoreButton,
    [componentRegistryKey('core', 'card')]: CoreCard,
    [componentRegistryKey('core', 'data')]: CoreData,
    [componentRegistryKey('core', 'action')]: CoreAction,
    [componentRegistryKey('core', 'section')]: CoreSection,
    [componentRegistryKey('core', 'navigate')]: CoreNavigate,
    [componentRegistryKey('core', 'title')]: CoreTitle,
    [componentRegistryKey('core', 'table')]: CoreTable,
    [componentRegistryKey('core', 'column')]: CoreColumn,
    [componentRegistryKey('core', 'summary')]: CoreSummary,
    [componentRegistryKey('core', 'field')]: CoreField,
    [componentRegistryKey('core', 'code')]: CoreCode,
    [componentRegistryKey('core', 'file')]: CoreFile,
};
