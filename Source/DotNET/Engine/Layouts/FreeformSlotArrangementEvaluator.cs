// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.Layouts;

/// <summary>
/// Evaluates a <see cref="FreeformSlotArrangement"/> for a given <see cref="SizeClass"/> - the counterpart
/// to <see cref="FreeformArrangementEvaluator"/> for a <see cref="Layout"/>'s own macro
/// <see cref="Layout.Arrangement"/>, which places the layout's slots themselves rather than the content of
/// one slot.
/// </summary>
public static class FreeformSlotArrangementEvaluator
{
    /// <summary>
    /// Selects the <see cref="FreeformSlotVariant"/> that targets a given <see cref="SizeClass"/>.
    /// </summary>
    /// <param name="arrangement">The <see cref="FreeformSlotArrangement"/> to evaluate.</param>
    /// <param name="sizeClass">The current <see cref="SizeClass"/>.</param>
    /// <returns>
    /// The variant whose <see cref="FreeformSlotVariant.SizeClass"/> exactly matches, or <see langword="null"/>
    /// when nothing targets it. There is deliberately no fallback here - a size class with no matching
    /// variant is a design-time/build-time warning elsewhere, never a silently picked variant.
    /// </returns>
    public static FreeformSlotVariant? Evaluate(FreeformSlotArrangement arrangement, SizeClass sizeClass) =>
        arrangement.Variants.FirstOrDefault(variant => variant.SizeClass == sizeClass);
}
