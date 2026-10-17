// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The answer a package list needs: rows, addable packages and who supplies what.
/// </summary>
/// <param name="Rows">The rows in the designer's order.</param>
/// <param name="Addable">The packages that can be added.</param>
/// <param name="Suppliers">Who supplies every component.</param>
public record PackageListing(
    IReadOnlyList<PackageRow> Rows,
    IReadOnlyList<AddablePackage> Addable,
    IReadOnlyList<ComponentSupplier> Suppliers);
