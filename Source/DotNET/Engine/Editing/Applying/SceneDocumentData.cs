// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Moves a document between the record it is passed around as and the plain data an edit changes.
/// </summary>
static class SceneDocumentData
{
    /// <summary>
    /// Reads a document into data that shares nothing with it.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <returns>The data: an object with an array for each of the document's lists.</returns>
    public static JsonObject ToData(SceneDocument document) => new()
    {
        ["layouts"] = ToArray(document.Layouts),
        ["screenTemplates"] = ToArray(document.ScreenTemplates),
        ["dialogTemplates"] = ToArray(document.DialogTemplates),
        ["screens"] = ToArray(document.Screens),
        ["exposures"] = JsonSerializer.SerializeToNode(document.Exposures, SceneJson.Options),
        ["instanceContributions"] = JsonSerializer.SerializeToNode(document.InstanceContributions, SceneJson.Options)
    };

    /// <summary>
    /// Reads data back into a document.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns>The document.</returns>
    public static SceneDocument FromData(JsonObject data) => new()
    {
        Layouts = ToElements(data["layouts"]),
        ScreenTemplates = ToElements(data["screenTemplates"]),
        DialogTemplates = ToElements(data["dialogTemplates"]),
        Screens = ToElements(data["screens"]),
        Exposures = data["exposures"].Deserialize<List<ExposureDeclaration>>(SceneJson.Options) ?? [],
        InstanceContributions = data["instanceContributions"].Deserialize<List<InstanceContribution>>(SceneJson.Options) ?? []
    };

    static JsonArray ToArray(IReadOnlyList<JsonElement> elements) => new([.. elements.Select(element => JsonNode.Parse(element.GetRawText()))]);

    static List<JsonElement> ToElements(JsonNode? node) => node is JsonArray list ? [.. list.Select(item => JsonSerializer.SerializeToElement(item))] : [];
}
