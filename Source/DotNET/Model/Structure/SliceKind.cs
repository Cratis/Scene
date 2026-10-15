// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Structure;

/// <summary>
/// What kind of event-model slice a <see cref="SliceNode"/> is.
/// </summary>
public enum SliceKind
{
    /// <summary>A slice that accepts a command - user input that changes state.</summary>
    StateChange = 0,

    /// <summary>A slice that projects state into a read model for display.</summary>
    StateView = 1,

    /// <summary>A slice that reacts to events without user input.</summary>
    Automation = 2,
}
