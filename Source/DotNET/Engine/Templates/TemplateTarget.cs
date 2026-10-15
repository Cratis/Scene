// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Where a template is about to be applied: a level of the application hierarchy and what it sits inside.
/// </summary>
/// <param name="Scope">The hierarchy level.</param>
/// <param name="SliceKind">The kind of the slice when <paramref name="Scope"/> is <see cref="TemplateScope.Slice"/>, otherwise <see langword="null"/>.</param>
/// <param name="Container">The layout or template whose slots the template must fit, if known.</param>
/// <param name="Chain">The names of the templates already chosen above the target, outermost first. A template in the chain is not offered again, because nesting it inside itself would loop.</param>
public record TemplateTarget(
    TemplateScope Scope,
    SliceKind? SliceKind = null,
    TemplateContainer? Container = null,
    IReadOnlyList<string>? Chain = null);
