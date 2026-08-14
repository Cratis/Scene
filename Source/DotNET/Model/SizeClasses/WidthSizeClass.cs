// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SizeClasses;

/// <summary>
/// The width axis of a <see cref="SizeClass"/>.
/// </summary>
public enum WidthSizeClass
{
    /// <summary>
    /// A narrow available width, e.g. a phone in portrait orientation.
    /// </summary>
    Compact = 0,

    /// <summary>
    /// A wide available width, e.g. a tablet or desktop.
    /// </summary>
    Regular = 1
}
