// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// What a binding target does when its source resolves to null or undefined.
/// </summary>
public enum BindingNullBehavior
{
    /// <summary>Propagate null to the target.</summary>
    Propagate = 0,

    /// <summary>Clear the target to its empty state.</summary>
    Clear = 1,

    /// <summary>Leave the target's current value unchanged.</summary>
    Preserve = 2,
}
