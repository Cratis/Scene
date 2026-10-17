// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The kinds of version rule for the shell blueprint.
/// </summary>
public enum VersionRuleKind
{
    /// <summary>
    /// Follow compatible versions: caret of the installed version.
    /// </summary>
    Follow = 0,

    /// <summary>
    /// Stay on exactly this version.
    /// </summary>
    Pin = 1,

    /// <summary>
    /// Always take the latest.
    /// </summary>
    Latest = 2
}
