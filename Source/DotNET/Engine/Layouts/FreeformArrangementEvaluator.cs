// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.Layouts;

/// <summary>
/// Evaluates a <see cref="FreeformArrangement"/> for a given <see cref="SizeClass"/> - part of Cratis/Scene#4.
/// </summary>
public static class FreeformArrangementEvaluator
{
    /// <summary>
    /// Selects the <see cref="FreeformVariant"/> that targets a given <see cref="SizeClass"/>.
    /// </summary>
    /// <param name="arrangement">The <see cref="FreeformArrangement"/> to evaluate.</param>
    /// <param name="sizeClass">The current <see cref="SizeClass"/>.</param>
    /// <returns>
    /// The variant whose <see cref="FreeformVariant.SizeClass"/> exactly matches, or <see langword="null"/>
    /// when nothing targets it. There is deliberately no fallback here - a size class with no matching
    /// variant is a design-time/build-time warning elsewhere, never a silently picked variant.
    /// </returns>
    public static FreeformVariant? Evaluate(FreeformArrangement arrangement, SizeClass sizeClass) =>
        arrangement.Variants.FirstOrDefault(variant => variant.SizeClass == sizeClass);
}
