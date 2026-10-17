// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// What a package edit did.
/// </summary>
public enum PackageEditOutcome
{
    /// <summary>
    /// The package, with what it needs, was added.
    /// </summary>
    Added = 0,

    /// <summary>
    /// The package was removed.
    /// </summary>
    Removed = 1,

    /// <summary>
    /// The package moved one row.
    /// </summary>
    Moved = 2,

    /// <summary>
    /// The profile changed in some other way (a blueprint or theme choice).
    /// </summary>
    Changed = 3,

    /// <summary>
    /// Nothing to do: the package is already there, or the move would change nothing.
    /// </summary>
    Unchanged = 4,

    /// <summary>
    /// The rules do not allow it; the message says why, with real names.
    /// </summary>
    Refused = 5
}
