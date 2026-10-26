// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Bindings;

/// <summary>A known command response, distinct from unavailable metadata.</summary>
/// <param name="Kind">Either void or value.</param>
/// <param name="Type">The structural type when the response is a value.</param>
public record ResponseContract(string Kind, ResponseValueType? Type = null);
