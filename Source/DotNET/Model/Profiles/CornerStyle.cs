// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// How rounded the corners of buttons, cards, the logo block and menu items are.
/// </summary>
public enum CornerStyle
{
    /// <summary>
    /// Square-ish corners: 4 px.
    /// </summary>
    Sharp = 0,

    /// <summary>
    /// The theme's own corner radius. The default.
    /// </summary>
    Default = 1,

    /// <summary>
    /// Generously rounded corners: 18 px.
    /// </summary>
    Round = 2
}
