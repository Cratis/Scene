// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// The length of a grid row or column, which can be absolute, sized to its content, or a weighted
/// share of the space the absolute and content-sized tracks leave behind.
/// </summary>
/// <param name="Value">The numeric value, read according to <paramref name="UnitType"/>.</param>
/// <param name="UnitType">How <paramref name="Value"/> is interpreted.</param>
public record GridLength(double Value = 1, GridUnitType UnitType = GridUnitType.Star)
{
    /// <summary>
    /// A length sized to the content it holds.
    /// </summary>
    public static readonly GridLength Auto = new(0, GridUnitType.Auto);

    /// <summary>
    /// A single share of the leftover space.
    /// </summary>
    public static readonly GridLength Star = new(1, GridUnitType.Star);

    /// <summary>
    /// Create an absolute length.
    /// </summary>
    /// <param name="value">The absolute length.</param>
    /// <returns>A new <see cref="GridLength"/>.</returns>
    public static GridLength Absolute(double value) => new(value, GridUnitType.Absolute);

    /// <summary>
    /// Create a weighted share of the leftover space.
    /// </summary>
    /// <param name="weight">The weight, relative to the other starred tracks.</param>
    /// <returns>A new <see cref="GridLength"/>.</returns>
    public static GridLength Stars(double weight) => new(weight, GridUnitType.Star);
}
