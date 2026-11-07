// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// The outcome of upgrading a stored Scene document from the outlet shape to the slot shape.
/// </summary>
/// <param name="Document">The document in the slot shape. Parts that could not be mapped are left as they were.</param>
/// <param name="Changed">Whether the upgraded document differs from the one that came in. Always false for a document already in the slot shape.</param>
/// <param name="Diagnostics">What could not be mapped.</param>
public record SlotShapeUpgrade(JsonNode? Document, bool Changed, IReadOnlyList<SlotShapeDiagnostic> Diagnostics);
