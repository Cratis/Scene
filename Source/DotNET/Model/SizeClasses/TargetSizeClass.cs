// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SizeClasses;

/// <summary>
/// Defines the size a deployment target assumes by default.
/// </summary>
/// <remarks>
/// Deliberately a different vocabulary from <see cref="WidthSizeClass"/> and <see cref="HeightSizeClass"/>.
/// Those two form the matrix an arrangement resolves against, where the distinction that matters is only
/// whether an axis is cramped. What a target assumes is a coarser, one-dimensional statement about the device
/// - a desktop is not merely "regular" - and it carries a third value because of it.
/// <para>
/// Treating the two as one vocabulary is what made a document declaring <c language="csharp">target size expanded</c> - which
/// Screenplay admits and its own documentation uses - crash the translation instead of rendering.
/// </para>
/// </remarks>
public enum TargetSizeClass
{
    /// <summary>A phone, or a window narrowed to the same effect.</summary>
    Compact = 0,

    /// <summary>A tablet, or a partially sized window.</summary>
    Regular = 1,

    /// <summary>A desktop, or anything with room to spare.</summary>
    Expanded = 2
}
