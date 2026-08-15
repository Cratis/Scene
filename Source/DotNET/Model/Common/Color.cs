// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// Represents a color as four channels, independent of any specific rendering platform's color type.
/// </summary>
/// <param name="Red">The red channel.</param>
/// <param name="Green">The green channel.</param>
/// <param name="Blue">The blue channel.</param>
/// <param name="Alpha">The alpha (opacity) channel.</param>
public record Color(byte Red, byte Green, byte Blue, byte Alpha = 255);
