// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// What a host says one outlet takes, overriding what the template's own content implies.
/// </summary>
/// <param name="Components">The components it takes.</param>
/// <param name="Categories">The categories it takes.</param>
/// <param name="Max">The most it holds.</param>
public record DesignOutletRuleInput(IReadOnlyList<string>? Components = null, IReadOnlyList<string>? Categories = null, int? Max = null);
