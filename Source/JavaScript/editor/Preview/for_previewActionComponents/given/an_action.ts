// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HorizontalAlignment, VerticalAlignment, Visibility, type ExternalComponent } from '@cratis/scene.model';

export const an_action: ExternalComponent = {
    id: 'change-quantity', name: 'change-quantity', componentName: 'core:action', slots: {},
    properties: { command: 'ChangeBasketQuantity' },
    visibility: Visibility.Visible, isEnabled: true, opacity: 1, zIndex: 0,
    size: {}, minimumSize: {}, maximumSize: {}, margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
};
