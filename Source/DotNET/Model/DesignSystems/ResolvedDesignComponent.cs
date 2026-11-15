// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A component with its variants resolved to values in one theme and mode.
/// </summary>
/// <param name="Name">The component's name.</param>
/// <param name="Variants">The resolved variants.</param>
public record ResolvedDesignComponent(string Name, IReadOnlyList<ResolvedDesignVariant> Variants);
