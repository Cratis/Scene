// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// What a conflict is about.
/// </summary>
public enum DesignSystemConflictKind
{
    /// <summary>
    /// Two colors that are nearly the same - two greys for the same border.
    /// </summary>
    Color = 0,

    /// <summary>
    /// Two corner radii that are nearly the same - 6px and 8px for the same card.
    /// </summary>
    Corner = 1,
}
