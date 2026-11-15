// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A variant of a design-system component and the states it declares.
/// </summary>
/// <param name="Name">The variant's name.</param>
/// <param name="States">The states it declares.</param>
public record DesignVariantEntry(string Name, IReadOnlyList<string> States);
