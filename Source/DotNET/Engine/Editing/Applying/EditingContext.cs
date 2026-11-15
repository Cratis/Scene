// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What editing needs to know besides the document: what can be described, what is being edited, and which queries the host offers.
/// </summary>
/// <param name="Catalog">The descriptors of the components and layout types in play.</param>
/// <param name="Scope">The screen, template or layout being edited; it decides what is local.</param>
/// <param name="QueryCandidates">The queries a property may be bound to, as the host discovered them. When a query reference is edited it is checked against these; without them it is checked for shape only.</param>
public sealed record EditingContext(DescriptorCatalog Catalog, EditingScope Scope, IReadOnlyList<QueryCandidate>? QueryCandidates = null);
