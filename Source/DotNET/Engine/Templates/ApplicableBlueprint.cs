// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// A blueprint that has at least one template applicable at the target, with those templates by category.
/// </summary>
/// <param name="Blueprint">The blueprint package name.</param>
/// <param name="Version">The installed version of the blueprint.</param>
/// <param name="DisplayName">A human-readable name for a picker, falling back to <paramref name="Blueprint"/>.</param>
/// <param name="Categories">The applicable templates grouped by category.</param>
public record ApplicableBlueprint(string Blueprint, string Version, string? DisplayName, IReadOnlyList<ApplicableTemplateGroup> Categories);
