// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// A Scene component as the linker sees it: where it lives, which properties it declares and the anatomy it takes from a design system.
/// </summary>
/// <param name="Component">The package-qualified name, <c language="csharp">&lt;package&gt;:&lt;bare name&gt;</c>.</param>
/// <param name="Properties">The paths of the properties the component declares.</param>
/// <param name="Anatomy">The anatomy it declares, or <see langword="null"/> when it takes no look from a design system.</param>
public record LinkableComponent(string Component, IReadOnlyList<string> Properties, ComponentAnatomy? Anatomy);
