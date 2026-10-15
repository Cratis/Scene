// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// Binds one specific pack to one read model or shape, overriding the application's active pack.
/// </summary>
/// <param name="Target">The read model or shape name the binding applies to.</param>
/// <param name="Pack">The identity of the bound pack.</param>
public record SampleDataBinding(string Target, string Pack);
