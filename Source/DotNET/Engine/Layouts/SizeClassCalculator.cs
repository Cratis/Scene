// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.Layouts;

/// <summary>
/// Computes the current <see cref="SizeClass"/> from actual available dimensions - shared by every
/// renderer (<c>Scene.React</c>, any future native renderer, Studio's preview surface) so they all agree
/// on when a class boundary is crossed. Reactive (recompute on resize) vs. fixed-per-launch (mobile,
/// where orientation change is the only runtime variable) are both just "call this again when the
/// dimensions you have available change" - the API shape is the same either way, only the caller's
/// triggering mechanism differs.
/// </summary>
public static class SizeClassCalculator
{
    /// <summary>
    /// The default width, in device-independent pixels, at or above which <see cref="WidthSizeClass.Regular"/> applies.
    /// </summary>
    public const double DefaultWidthBreakpoint = 600;

    /// <summary>
    /// The default height, in device-independent pixels, at or above which <see cref="HeightSizeClass.Regular"/> applies.
    /// </summary>
    public const double DefaultHeightBreakpoint = 600;

    /// <summary>
    /// Computes the <see cref="SizeClass"/> for a given available width and height.
    /// </summary>
    /// <param name="width">The available width, in device-independent pixels.</param>
    /// <param name="height">The available height, in device-independent pixels.</param>
    /// <param name="widthBreakpoint">The width at or above which <see cref="WidthSizeClass.Regular"/> applies. Defaults to <see cref="DefaultWidthBreakpoint"/>.</param>
    /// <param name="heightBreakpoint">The height at or above which <see cref="HeightSizeClass.Regular"/> applies. Defaults to <see cref="DefaultHeightBreakpoint"/>.</param>
    /// <returns>The computed <see cref="SizeClass"/>.</returns>
    public static SizeClass Compute(double width, double height, double widthBreakpoint = DefaultWidthBreakpoint, double heightBreakpoint = DefaultHeightBreakpoint) =>
        new(
            width >= widthBreakpoint ? WidthSizeClass.Regular : WidthSizeClass.Compact,
            height >= heightBreakpoint ? HeightSizeClass.Regular : HeightSizeClass.Compact);
}
