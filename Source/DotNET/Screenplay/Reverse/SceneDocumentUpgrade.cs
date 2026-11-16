// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Slots;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Brings a Scene document stored before Scene 5 to the slot shape when it is read.
/// </summary>
/// <remarks>
/// A screen document, template document or UI profile stored before Scene 5 holds regions as outlets, navigation as regions,
/// toolbars as their own element and an action's presentation. Scene's document upgrader brings it to the slot shape when it is
/// read; nothing stored is rewritten, so a host keeps the shape it appended and the next save writes the new shape.
/// </remarks>
public static class SceneDocumentUpgrade
{
    /// <summary>
    /// Gets the document in the slot shape. Text that is not JSON is returned as it was, for the reader to refuse as it always has.
    /// </summary>
    /// <param name="document">The Scene document text.</param>
    /// <returns>The document in the slot shape.</returns>
    public static string Upgrade(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
        {
            return document;
        }

        try
        {
            var upgrade = SlotShapeUpgrader.Upgrade(JsonNode.Parse(document));
            return upgrade.Changed && upgrade.Document is not null ? upgrade.Document.ToJsonString() : document;
        }
        catch (JsonException)
        {
            return document;
        }
    }

    /// <summary>
    /// Gets a nullable stored document in the slot shape.
    /// </summary>
    /// <param name="document">The Scene document text, if any.</param>
    /// <returns>The document in the slot shape, or null when there is none.</returns>
    public static string? UpgradeOptional(string? document) => document is null ? null : Upgrade(document);

    /// <summary>
    /// Gets a parsed document in the slot shape. The document passed in is not changed.
    /// </summary>
    /// <param name="document">The parsed Scene document.</param>
    /// <returns>The document in the slot shape.</returns>
    public static JsonObject Upgrade(JsonObject document) =>
        SlotShapeUpgrader.Upgrade(document) is { Changed: true, Document: JsonObject upgraded } ? upgraded : document;
}
