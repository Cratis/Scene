// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.for_SharedFixtures;

/// <summary>
/// Reads scene-design-fixtures.json, which the TypeScript package produced and its own spec asserts too, and gives each section the way the
/// C# package takes its input.
/// </summary>
public static class DesignCorpus
{
    static readonly Lazy<JsonObject> _corpus = new(() => JsonNode.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "scene-design-fixtures.json")))!.AsObject());

    /// <summary>
    /// Gets the corpus.
    /// </summary>
    public static JsonObject Corpus => _corpus.Value;

    /// <summary>
    /// Gets the cases of a section.
    /// </summary>
    /// <param name="section">The section.</param>
    /// <returns>The cases.</returns>
    public static IEnumerable<JsonObject> Cases(string section) => Corpus[section]!.AsArray().Select(node => node!.AsObject());

    /// <summary>
    /// Reads a catalogue input of the corpus.
    /// </summary>
    /// <param name="name">The name of the input.</param>
    /// <returns>The input.</returns>
    public static DesignCatalogueInput Input(string name) => Corpus["inputs"]![name].Deserialize<DesignCatalogueInput>(DesignJson.Options)!;

    /// <summary>
    /// Reads a workspace of the corpus.
    /// </summary>
    /// <param name="name">The name of the workspace.</param>
    /// <returns>The workspace.</returns>
    public static DesignWorkspace Workspace(string name) => Corpus["workspaces"]![name].Deserialize<DesignWorkspace>(DesignJson.Options)!;

    /// <summary>
    /// Writes a value the way the corpus records it.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>The JSON.</returns>
    public static JsonNode? Write(object? value) => JsonSerializer.SerializeToNode(value, value?.GetType() ?? typeof(object), DesignJson.Options);

    /// <summary>
    /// Finds the first place two JSON values differ, so that a mismatch says where rather than printing both documents.
    /// </summary>
    /// <param name="actual">What the C# package gave.</param>
    /// <param name="expected">What the corpus records.</param>
    /// <param name="path">Where the values are in their documents.</param>
    /// <returns>A description of the first difference; null when there is none.</returns>
    public static string? FirstDifference(JsonNode? actual, JsonNode? expected, string path = "$")
    {
        if (JsonNode.DeepEquals(actual, expected))
        {
            return null;
        }

        if (actual is JsonObject actualObject && expected is JsonObject expectedObject)
        {
            foreach (var key in actualObject.Select(pair => pair.Key).Union(expectedObject.Select(pair => pair.Key)))
            {
                var difference = FirstDifference(actualObject[key], expectedObject[key], $"{path}.{key}");
                if (difference is not null)
                {
                    return difference;
                }
            }
        }

        if (actual is JsonArray actualArray && expected is JsonArray expectedArray)
        {
            for (var index = 0; index < Math.Max(actualArray.Count, expectedArray.Count); index++)
            {
                var difference = FirstDifference(index < actualArray.Count ? actualArray[index] : null, index < expectedArray.Count ? expectedArray[index] : null, $"{path}[{index}]");
                if (difference is not null)
                {
                    return difference;
                }
            }
        }

        return $"{path}: {Shorten(actual)}, expected {Shorten(expected)}";
    }

    static string Shorten(JsonNode? node)
    {
        var text = node?.ToJsonString() ?? "(absent)";
        return text.Length > 300 ? $"{text[..300]}..." : text;
    }

    /// <summary>
    /// Finds the repository root.
    /// </summary>
    /// <returns>The path.</returns>
    /// <exception cref="InvalidOperationException">There is no repository above the specs.</exception>
    public static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Could not find the repository root (Scene.slnx).");
    }
}
