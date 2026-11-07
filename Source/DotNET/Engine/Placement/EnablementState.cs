// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Whether an action can be used. The TypeScript engine uses the same values (<c language="csharp">EnablementState</c>).
/// </summary>
public enum EnablementState
{
    /// <summary>The action can be used.</summary>
    Enabled = 0,

    /// <summary>The action is shown but cannot be used yet.</summary>
    Disabled = 1,

    /// <summary>The action is not shown, because the persona cannot issue its command.</summary>
    Hidden = 2,
}
