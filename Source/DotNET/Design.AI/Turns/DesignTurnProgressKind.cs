// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// The kinds of <see cref="DesignTurnProgress"/>; the strings are what the canvas's <c language="text">ai.runTurn</c> seam reports.
/// </summary>
public static class DesignTurnProgressKind
{
    /// <summary>
    /// What the turn is doing.
    /// </summary>
    public const string Status = "status";

    /// <summary>
    /// What the turn says to the person.
    /// </summary>
    public const string Reply = "reply";

    /// <summary>
    /// A screen the turn changed that is clean.
    /// </summary>
    public const string Screen = "screen";
}
