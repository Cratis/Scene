// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// The unit used by a command-form column, gap or field width.
/// </summary>
public enum FormWidthUnit
{
    /// <summary>
    /// A CSS-style fractional unit.
    /// </summary>
    Fraction = 0,

    /// <summary>
    /// Pixels.
    /// </summary>
    Pixels = 1,

    /// <summary>
    /// Percent.
    /// </summary>
    Percent = 2,

    /// <summary>
    /// Automatic width.
    /// </summary>
    Auto = 3,
}
