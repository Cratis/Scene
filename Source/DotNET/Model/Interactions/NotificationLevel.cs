// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Defines how prominently a <see cref="NotifyAction"/> surfaces its message.
/// </summary>
/// <remarks>Append only.</remarks>
public enum NotificationLevel
{
    /// <summary>Informational.</summary>
    Info = 0,

    /// <summary>A warning.</summary>
    Warning = 1,

    /// <summary>An error.</summary>
    Error = 2
}
