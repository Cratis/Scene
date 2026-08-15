// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// The visibility of an element.
/// </summary>
public enum Visibility
{
    /// <summary>
    /// The element is visible and occupies space.
    /// </summary>
    Visible = 0,

    /// <summary>
    /// The element is invisible but still occupies space.
    /// </summary>
    Hidden = 1,

    /// <summary>
    /// The element is invisible and occupies no space.
    /// </summary>
    Collapsed = 2
}
