// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// Represents a width and height. Either dimension left unspecified means the renderer decides.
/// </summary>
/// <param name="Width">The width, or <see langword="null"/> if unspecified.</param>
/// <param name="Height">The height, or <see langword="null"/> if unspecified.</param>
public record Size(double? Width = null, double? Height = null);
