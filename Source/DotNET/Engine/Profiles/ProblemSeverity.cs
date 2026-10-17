// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// How seriously a problem stops the profile.
/// </summary>
public enum ProblemSeverity
{
    /// <summary>
    /// The profile cannot be applied until it is resolved.
    /// </summary>
    Blocker = 0,

    /// <summary>
    /// The profile works, but the author probably does not want this.
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Worth knowing; nothing is wrong.
    /// </summary>
    Info = 2
}
