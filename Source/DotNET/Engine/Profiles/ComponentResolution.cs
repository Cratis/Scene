// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The outcome of resolving a bare or package-qualified component name against a <see cref="Model.Profiles.UiProfile"/>'s package list.
/// </summary>
/// <param name="Name">The bare component name within <see cref="Package"/>.</param>
/// <param name="Package">The package the name resolved to.</param>
/// <param name="Shadows">
/// Other active packages, in descending priority order, that also declare this name but were shadowed by
/// <see cref="Package"/> - this is what answers "why did this resolve to X and not Y". Always empty for a
/// package-qualified reference, which resolves directly against its named package and never runs shadow
/// tracking.
/// </param>
public record ComponentResolution(string Name, string Package, IReadOnlyList<string> Shadows);
