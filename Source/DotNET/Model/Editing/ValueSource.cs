// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Where the effective value of a property comes from.
/// </summary>
public enum ValueSource
{
    /// <summary>
    /// The value the owner declared.
    /// </summary>
    Default = 0,

    /// <summary>
    /// A value set on the node itself.
    /// </summary>
    Local = 1,

    /// <summary>
    /// A value an instance contributed.
    /// </summary>
    Instance = 2,
}
