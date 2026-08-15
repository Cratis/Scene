// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Control } from './Control';
import { SceneElement } from './SceneElement';
import { BindingExpression } from '../common';

/**
 * A {@link Control} that renders one instance of an item template per item in a bound collection.
 */
export interface ItemsControl extends Control {
    itemsSource: BindingExpression;
    itemTemplate: SceneElement;
}

export const ItemsControlPropertyNames: (keyof ItemsControl)[] = ['itemsSource', 'itemTemplate'];
