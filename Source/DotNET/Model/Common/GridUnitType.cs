// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// How a <see cref="GridLength"/>'s value is interpreted.
/// </summary>
public enum GridUnitType
{
    /// <summary>
    /// The length is decided by the content it holds.
    /// </summary>
    Auto = 0,

    /// <summary>
    /// The length is an absolute measurement.
    /// </summary>
    Absolute = 1,

    /// <summary>
    /// The length is a weighted share of whatever space is left over.
    /// </summary>
    Star = 2
}
