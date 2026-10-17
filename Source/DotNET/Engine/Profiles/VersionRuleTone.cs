// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// How a version status chip is coloured.
/// </summary>
public enum VersionRuleTone
{
    /// <summary>
    /// Up to date.
    /// </summary>
    Good = 0,

    /// <summary>
    /// An update is available and allowed.
    /// </summary>
    Info = 1,

    /// <summary>
    /// An update is available but not allowed.
    /// </summary>
    Warning = 2,

    /// <summary>
    /// The rule cannot be met or is not a rule.
    /// </summary>
    Bad = 3
}
