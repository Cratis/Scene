// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout } from '@cratis/scene.model';
import { appShellLayout } from './appShell';
import { fullPageLayout } from './fullPage';

/**
 * The layouts this package provides.
 *
 * Two, and deliberately only two - every application shell worth having is one of these, and everything
 * else this package ships is a page or dialog template that fits *into* one of them. The list is what the
 * manifest's `layouts` names and what the bundle provides, which is what `validatePackageBundle` proves.
 */
export const defaultLayouts: Layout[] = [appShellLayout, fullPageLayout];
