// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// How one enablement check turned out. The TypeScript engine uses the same values (<c language="csharp">EnablementOutcome</c>).
/// </summary>
public enum EnablementOutcome
{
    /// <summary>The check lets the action through.</summary>
    Passed = 0,

    /// <summary>The check holds the action back.</summary>
    Blocked = 1,

    /// <summary>The check could not be made here, so it does not hold the action back.</summary>
    Unchecked = 2,
}
