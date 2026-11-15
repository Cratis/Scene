// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// One owner in a template chain.
/// </summary>
/// <param name="Owner">The name of the layout, template, dialog template or screen.</param>
/// <param name="Kind">What kind of owner it is.</param>
/// <param name="Instance">The instance id the owner contributes as.</param>
/// <param name="Elements">The components in the owner.</param>
/// <param name="Exposures">What the owner exposes.</param>
sealed record TemplateChainLevel(
    string Owner,
    SceneNodeKind Kind,
    string Instance,
    IReadOnlyList<JsonObject> Elements,
    IReadOnlyList<ExposedProperty> Exposures);
