// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The property keys Scene's canvas reads to place a child.
export const canvasLeft = 'Canvas.Left';
export const canvasTop = 'Canvas.Top';

// Where the original legacy type is remembered, so the element can be shown by the legacy renderer and converted back.
export const legacyTypeKey = 'legacyType';

// The original legacy element, kept whole on anything that could not be converted.
export const legacyOriginalKey = 'legacy';

// Everything the legacy element held that Scene has no field for, so projecting back restores it.
export const legacyExtrasKey = 'legacyExtras';
