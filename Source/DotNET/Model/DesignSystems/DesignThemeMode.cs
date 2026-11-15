// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A theme's values in one mode: every token's value and every component part's value, with references already followed.
/// </summary>
/// <param name="Mode">The mode these values are for.</param>
/// <param name="Tokens">The resolved value of each token role, keyed by <c language="csharp">&lt;category&gt;.&lt;name&gt;</c>.</param>
/// <param name="Components">The components resolved to values, or <see langword="null"/> when they are to be evaluated from the anatomy and <paramref name="Tokens"/>.</param>
/// <param name="Problems">What could not be resolved, each as a message naming the token or part, or <see langword="null"/> for none.</param>
public record DesignThemeMode(
    string Mode,
    IReadOnlyDictionary<string, string> Tokens,
    IReadOnlyList<ResolvedDesignComponent>? Components = null,
    IReadOnlyList<string>? Problems = null);
