// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import type { PaletteSource } from '../Palette/buildPalette';

// The components the palette offers: everything the bundled Scene packages declare.
export const defaultPaletteSources: readonly PaletteSource[] =
    blueprintPreviewBundles.map(bundle => ({ package: bundle.manifest.name, components: bundle.manifest.components, descriptors: bundle.descriptors ?? [] }));
