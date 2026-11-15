// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A property every theme must satisfy: wherever a component has both parts, the foreground must reach the ratio against the background.
/// </summary>
/// <param name="Foreground">The part drawn on the background (<c language="csharp">text</c>).</param>
/// <param name="Background">The part it is drawn on (<c language="csharp">background</c>).</param>
/// <param name="MinimumRatio">The least WCAG contrast ratio (for example <c language="csharp">4.5</c>).</param>
public record ContrastRule(string Foreground, string Background, double MinimumRatio);
