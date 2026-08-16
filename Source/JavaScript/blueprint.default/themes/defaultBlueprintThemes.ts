// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { darkTheme } from './dark';
import { lightTheme } from './light';

/**
 * The themes this blueprint ships, in the order a picker should offer them.
 *
 * The list is what the manifest's `themes` names and what the bundle provides, so it is the one place the
 * two can be kept in step - `validatePackageBundle` proves they are.
 */
export const defaultBlueprintThemes: Theme[] = [lightTheme, darkTheme];
