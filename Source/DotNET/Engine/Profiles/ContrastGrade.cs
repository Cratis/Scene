// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// How well white text reads on a colour.
/// </summary>
public enum ContrastGrade
{
    /// <summary>
    /// At least 7:1.
    /// </summary>
    Aaa = 0,

    /// <summary>
    /// At least 4.5:1.
    /// </summary>
    Aa = 1,

    /// <summary>
    /// At least 3:1: readable only as large text.
    /// </summary>
    LargeTextOnly = 2,

    /// <summary>
    /// Below 3:1.
    /// </summary>
    Fails = 3
}
