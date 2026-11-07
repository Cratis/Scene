// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// What enablement checks, in the order it checks them. The TypeScript engine uses the same values
/// (<c language="csharp">EnablementCheck</c>).
/// </summary>
public enum EnablementCheck
{
    /// <summary>An action for an item waits for one to be selected.</summary>
    Subject = 0,

    /// <summary>The command's authorization hides the action from personas without it.</summary>
    Authorization = 1,

    /// <summary>The action's <c language="screenplay">enabled when</c> condition.</summary>
    Condition = 2,
}
