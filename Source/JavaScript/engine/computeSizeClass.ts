// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HeightSizeClass, SizeClass, WidthSizeClass } from '@cratis/scene.model';

/** The default width, in device-independent pixels, at or above which {@link WidthSizeClass.Regular} applies. */
export const defaultWidthBreakpoint = 600;

/** The default height, in device-independent pixels, at or above which {@link HeightSizeClass.Regular} applies. */
export const defaultHeightBreakpoint = 600;

/**
 * Computes the current {@link SizeClass} from actual available dimensions - shared by every renderer
 * (`Scene.React`, any future native renderer, Studio's preview surface) so they all agree on when a class
 * boundary is crossed. Reactive (recompute on resize) vs. fixed-per-launch (mobile, where orientation
 * change is the only runtime variable) are both just "call this again when the dimensions you have
 * available change" - the shape is the same either way, only the caller's triggering mechanism differs.
 *
 * @param width The available width, in device-independent pixels.
 * @param height The available height, in device-independent pixels.
 * @param widthBreakpoint The width at or above which {@link WidthSizeClass.Regular} applies. Defaults to {@link defaultWidthBreakpoint}.
 * @param heightBreakpoint The height at or above which {@link HeightSizeClass.Regular} applies. Defaults to {@link defaultHeightBreakpoint}.
 * @returns The computed {@link SizeClass}.
 */
export function computeSizeClass(width: number, height: number, widthBreakpoint = defaultWidthBreakpoint, heightBreakpoint = defaultHeightBreakpoint): SizeClass {
    return {
        width: width >= widthBreakpoint ? WidthSizeClass.Regular : WidthSizeClass.Compact,
        height: height >= heightBreakpoint ? HeightSizeClass.Regular : HeightSizeClass.Compact,
    };
}
