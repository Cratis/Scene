// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Toolbar;

/// <summary>
/// How prominent a toolbar button is.
/// </summary>
public enum ToolbarEmphasis
{
    /// <summary>The main action of the page: a solid, accented button.</summary>
    Primary = 0,

    /// <summary>A regular action: an outlined button. The default.</summary>
    Secondary = 1,

    /// <summary>A minor action: a plain button without a frame.</summary>
    Quiet = 2,
}
