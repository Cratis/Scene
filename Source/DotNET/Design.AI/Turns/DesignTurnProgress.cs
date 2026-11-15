// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// What a design turn reports while it runs, for a host to stream to the canvas.
/// </summary>
/// <param name="Kind">One of <see cref="DesignTurnProgressKind"/>.</param>
/// <param name="Text">The status or the reply; the name of the screen for <see cref="DesignTurnProgressKind.Screen"/>.</param>
public record DesignTurnProgress(string Kind, string Text)
{
    /// <summary>
    /// What the turn is doing.
    /// </summary>
    /// <param name="message">What it is doing.</param>
    /// <returns>The progress.</returns>
    public static DesignTurnProgress Status(string message) => new(DesignTurnProgressKind.Status, message);

    /// <summary>
    /// What the turn says to the person.
    /// </summary>
    /// <param name="text">The reply.</param>
    /// <returns>The progress.</returns>
    public static DesignTurnProgress Reply(string text) => new(DesignTurnProgressKind.Reply, text);

    /// <summary>
    /// A screen the turn changed that is clean.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <returns>The progress.</returns>
    public static DesignTurnProgress Screen(string screen) => new(DesignTurnProgressKind.Screen, screen);

    /// <summary>
    /// Gets the progress as the canvas's <c language="text">ai.runTurn</c> seam reads it: <c language="text">{ kind: 'status', message }</c>, <c language="text">{ kind: 'reply', text }</c>
    /// or <c language="text">{ kind: 'screen', screen }</c>.
    /// </summary>
    /// <returns>An object that serializes to it.</returns>
    public object ToWire() => Kind switch
    {
        DesignTurnProgressKind.Reply => new { kind = Kind, text = Text },
        DesignTurnProgressKind.Screen => new { kind = Kind, screen = Text },
        _ => new { kind = Kind, message = Text },
    };
}
