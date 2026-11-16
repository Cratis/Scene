// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// One of the layouts of a screen that variations offer: the screen as it would be on another template.
/// </summary>
/// <param name="Letter">A, B or C.</param>
/// <param name="Template">The template it is on.</param>
/// <param name="Screen">The screen, as Scene JSON.</param>
/// <param name="NotCarriedOver">What did not fit the template and was left out, in words.</param>
public record VariationCandidate(string Letter, string Template, JsonElement Screen, IReadOnlyList<string> NotCarriedOver);
