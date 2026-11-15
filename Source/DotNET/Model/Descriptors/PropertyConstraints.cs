// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// The limits on a property's value.
/// </summary>
/// <param name="Required">Whether a value is required.</param>
/// <param name="Minimum">The smallest number.</param>
/// <param name="Maximum">The largest number.</param>
/// <param name="Integer">Whether the number must be whole.</param>
/// <param name="MinimumLength">The shortest text.</param>
/// <param name="MaximumLength">The longest text.</param>
/// <param name="Pattern">A regular expression the whole text must match.</param>
/// <param name="MinimumItems">The fewest items.</param>
/// <param name="MaximumItems">The most items.</param>
/// <param name="ResultShapes">The result shapes a query binding may have.</param>
[SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "The property names are the contract shared with the TypeScript model.")]
public record PropertyConstraints(
    bool? Required = null,
    double? Minimum = null,
    double? Maximum = null,
    bool? Integer = null,
    int? MinimumLength = null,
    int? MaximumLength = null,
    string? Pattern = null,
    int? MinimumItems = null,
    int? MaximumItems = null,
    IReadOnlyList<QueryResultShape>? ResultShapes = null);
