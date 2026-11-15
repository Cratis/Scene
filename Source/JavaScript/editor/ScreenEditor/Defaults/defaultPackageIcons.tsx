// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType } from 'react';
import { FaCube, FaHeading, FaPaintBrush, FaPuzzlePiece, FaShapes, FaThList, FaToggleOn } from 'react-icons/fa';
import { corePackage } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { primeReactPackage } from '@cratis/scene.primereact';
import { tailwindPackage } from '@cratis/scene.tailwind';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { componentsBlueprint } from '@cratis/scene.blueprint.components';

// An icon component as the palette draws it; it is always decorative, so it is only ever drawn hidden from assistive technology.
export type PackageIcon = ComponentType<{ 'aria-hidden'?: boolean | 'true' | 'false' }>;

// The icon each package's drawer is drawn with, by the package's name. Every package the editor ships has its own, chosen for what
// the package is for, so the drawers read apart at a glance; none of them is the Layout drawer's icon.
export const defaultPackageIcons: Readonly<Record<string, PackageIcon>> = {
    [corePackage.manifest.name]: FaShapes,
    [primeReactPackage.manifest.name]: FaToggleOn,
    [cratisComponentsPackage.manifest.name]: FaPuzzlePiece,
    [defaultBlueprint.manifest.name]: FaThList,
    [componentsBlueprint.manifest.name]: FaHeading,
    [tailwindPackage.manifest.name]: FaPaintBrush,
};

// What a package this editor does not know is drawn with.
export const unknownPackageIcon: PackageIcon = FaCube;
