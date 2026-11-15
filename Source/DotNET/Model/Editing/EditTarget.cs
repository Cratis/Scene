// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// What an edit of a property addresses.
/// </summary>
public enum EditTarget
{
    /// <summary>
    /// The node itself.
    /// </summary>
    Node = 0,

    /// <summary>
    /// What an instance contributes.
    /// </summary>
    Instance = 1,
}
