// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// One owner in a template chain: a layout, a template or the screen at the end.
/// </summary>
/// <param name="Owner">The name of the layout, template, dialog template or screen.</param>
/// <param name="Instance">The id it contributes under.</param>
/// <param name="Components">The components it contains, by id.</param>
/// <param name="Exposures">What it exposes - and, for a nested template, re-exposes - to what sits inside it.</param>
sealed record TemplateChainLevel(
    string Owner,
    string Instance,
    IReadOnlyDictionary<string, JsonElement> Components,
    IReadOnlyList<ExposedProperty> Exposures);
