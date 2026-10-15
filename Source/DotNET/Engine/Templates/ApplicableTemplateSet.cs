// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// What a template picker offers at a target: own templates by category first, then the blueprints that have anything applicable.
/// </summary>
/// <param name="Own">The own templates that apply, grouped by category.</param>
/// <param name="Blueprints">The blueprints with at least one applicable template. A blueprint with none is omitted, never listed empty.</param>
public record ApplicableTemplateSet(IReadOnlyList<ApplicableTemplateGroup> Own, IReadOnlyList<ApplicableBlueprint> Blueprints);
