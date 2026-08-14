// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SizeClasses;

/// <summary>
/// A width × height size class, UIKit-style. Phone portrait/landscape, tablet and desktop all fall out
/// of this matrix — there is deliberately no separate orientation concept.
/// </summary>
/// <param name="Width">The width axis.</param>
/// <param name="Height">The height axis.</param>
public record SizeClass(WidthSizeClass Width, HeightSizeClass Height);
