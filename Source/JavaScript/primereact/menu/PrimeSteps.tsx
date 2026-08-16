// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { numberProperty } from '../properties';
import { Steps } from './Steps';

/**
 * The `PrimeReact:steps` component - progress through a sequence, shown as numbered labels.
 *
 * Unlike `stepper` this shows position only and owns no content; a screen pairs it with whatever it wants
 * to render per step.
 *
 * PrimeReact 11 removed `steps` with nothing to replace it - `stepper` survives, but it owns the content of
 * each step and drives moving between them, which is the other component Scene already registers - so what
 * this adapts is Scene's own {@link Steps}.
 *
 * The position is now read straight from the element on every render rather than seeded into local state.
 * Scene's own {@link Steps} is a read-only indicator, so there is nothing left that could move the position
 * behind the authored value's back, and holding a copy of it would only let the two disagree.
 */
export function PrimeSteps({ element }: RegisteredComponentProps) {
    return <Steps data-scene-id={element.id} items={menuItemsProperty(element, 'items')} activeIndex={numberProperty(element, 'activeIndex', 0)} />;
}
