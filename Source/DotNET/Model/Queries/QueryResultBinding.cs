// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// Where one field of a bound query's result goes.
/// </summary>
/// <param name="Target">What it is bound to.</param>
/// <param name="Field">The result field.</param>
public record QueryResultBinding(
    string Target,
    string Field);
