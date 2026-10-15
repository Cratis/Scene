// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// The rows a <see cref="SampleDataPack"/> provides for one shape.
/// </summary>
/// <param name="Shape">The shape's name. Matches a read model of the same name unless the selection maps it elsewhere.</param>
/// <param name="Rows">The rows: JSON objects keyed by the shape's field names.</param>
public record SampleDataSet(string Shape, IReadOnlyList<JsonObject> Rows);
