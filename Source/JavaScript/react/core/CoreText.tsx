// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '../renderer';

/**
 * The `core:text` component - the minimum vocabulary a `ui profile` can always fall back to, regardless
 * of which packages it lists, per Scene#3's `core` fallback guarantee.
 */
export function CoreText({ element }: RegisteredComponentProps) {
    const text = typeof element.properties.text === 'string' ? element.properties.text : '';
    return <span data-scene-id={element.id}>{text}</span>;
}
