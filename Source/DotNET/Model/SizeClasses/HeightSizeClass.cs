// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SizeClasses;

/// <summary>
/// The height axis of a <see cref="SizeClass"/>.
/// </summary>
public enum HeightSizeClass
{
    /// <summary>
    /// A short available height, e.g. a phone in landscape orientation.
    /// </summary>
    Compact = 0,

    /// <summary>
    /// A tall available height, e.g. a phone in portrait orientation, or a tablet/desktop.
    /// </summary>
    Regular = 1
}
