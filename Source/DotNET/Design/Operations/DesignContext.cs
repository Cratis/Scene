// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What operations are checked and lowered against: the catalogue, and the descriptors and templates it was built from.
/// </summary>
/// <param name="Catalogue">The catalogue.</param>
/// <param name="Descriptors">The component descriptors.</param>
/// <param name="Templates">Every template the host has, to copy into the document when a screen is built on one.</param>
/// <param name="QueryCandidates">The queries a component may be bound to.</param>
public record DesignContext(
    DesignCatalogue Catalogue,
    IReadOnlyList<ComponentDescriptor> Descriptors,
    IReadOnlyList<JsonElement> Templates,
    IReadOnlyList<QueryCandidate>? QueryCandidates = null)
{
    /// <summary>
    /// Builds the catalogue of an input and keeps what the operations need besides it.
    /// </summary>
    /// <param name="input">What the catalogue is built from.</param>
    /// <returns>The context.</returns>
    public static DesignContext Create(DesignCatalogueInput input) =>
        new(DesignCatalogueBuilder.Build(input), input.Descriptors, input.Templates, input.Queries);
}
