// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentsBlueprint } from '@cratis/scene.blueprint.components';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { primeReactPackage } from '@cratis/scene.primereact';
import { ScenePackageBundle, corePackage } from '@cratis/scene.react';
import { tailwindPackage } from '@cratis/scene.tailwind';

/** Every package bundle this repository ships. A new package belongs in this list the day it is added. */
export const inRepositoryPackages: ScenePackageBundle[] = [
    corePackage,
    cratisComponentsPackage,
    primeReactPackage,
    tailwindPackage,
    defaultBlueprint,
    componentsBlueprint,
];
