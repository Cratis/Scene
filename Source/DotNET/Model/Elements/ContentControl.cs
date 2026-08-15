// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="Control"/> that hosts a single piece of content.
/// </summary>
public record ContentControl : Control
{
    /// <summary>
    /// Gets the content hosted by the control.
    /// </summary>
    public required SceneElement Content { get; init; }
}
