// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// A Scene document read for comparison. Layouts, templates and screens are kept as the data they are, by name, because a change
/// to them is judged by whether they differ, not by what they mean; exposures and contributions are read into the model, because
/// what they grant is judged. Where a name occurs twice the first wins, as it does for the editing engine.
/// </summary>
sealed class ParsedSceneDocument
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { Converters = { new CollectionOperationConverter() } };
    static readonly JsonDocumentOptions _documentOptions = new() { MaxDepth = 256 };

    /// <summary>
    /// Gets the layouts by name.
    /// </summary>
    public Dictionary<string, JsonElement> Layouts { get; } = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets the screen templates by name.
    /// </summary>
    public Dictionary<string, JsonElement> ScreenTemplates { get; } = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets the dialog templates by name.
    /// </summary>
    public Dictionary<string, JsonElement> DialogTemplates { get; } = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets the screens by name.
    /// </summary>
    public Dictionary<string, JsonElement> Screens { get; } = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets what each layout or template exposes, by owner.
    /// </summary>
    public Dictionary<string, ExposureEntry> Exposures { get; } = new(StringComparer.Ordinal);

    /// <summary>
    /// Gets what each instance set, in the order stored.
    /// </summary>
    public List<ContributionEntry> Contributions { get; } = [];

    /// <summary>
    /// Reads a document.
    /// </summary>
    /// <param name="json">The JSON text.</param>
    /// <param name="document">The document, when it could be read.</param>
    /// <param name="problem">Why it could not be read, when it could not.</param>
    /// <returns><see langword="true"/> when the text is a Scene document; otherwise <see langword="false"/>.</returns>
    public static bool TryParse(string? json, out ParsedSceneDocument? document, out string problem)
    {
        document = null;
        problem = string.Empty;

        if (string.IsNullOrWhiteSpace(json))
        {
            problem = "the document is empty";
            return false;
        }

        try
        {
            using var parsed = JsonDocument.Parse(json, _documentOptions);
            var root = parsed.RootElement;
            var result = new ParsedSceneDocument();
            var collections = new (string Name, Dictionary<string, JsonElement> Target)[]
            {
                ("layouts", result.Layouts),
                ("screenTemplates", result.ScreenTemplates),
                ("dialogTemplates", result.DialogTemplates),
                ("screens", result.Screens),
            };

            if (root.ValueKind != JsonValueKind.Object)
            {
                problem = "the document is not a JSON object";
                return false;
            }

            foreach (var (name, target) in collections)
            {
                if (!ReadNamed(root, name, target, out problem))
                {
                    return false;
                }
            }

            if (!ReadExposures(root, result, out problem) || !ReadContributions(root, result, out problem))
            {
                return false;
            }

            document = result;
            return true;
        }
        catch (JsonException)
        {
            problem = "the document is not valid JSON";
            return false;
        }
    }

    /// <summary>
    /// Gets what one instance set.
    /// </summary>
    /// <param name="instance">The id of the instance.</param>
    /// <returns>Its contributions.</returns>
    public IEnumerable<ContributionEntry> ContributionsOf(string instance) =>
        Contributions.Where(entry => entry.Instance == instance);

    static bool ReadNamed(JsonElement root, string collection, Dictionary<string, JsonElement> target, out string problem)
    {
        problem = string.Empty;
        if (!root.TryGetProperty(collection, out var items) || items.ValueKind != JsonValueKind.Array)
        {
            problem = $"'{collection}' is missing or is not a list";
            return false;
        }

        foreach (var item in items.EnumerateArray())
        {
            var name = JsonData.String(item, "name");
            if (name is null)
            {
                problem = $"an entry of '{collection}' has no name";
                return false;
            }

            target.TryAdd(name, item.Clone());
        }

        return true;
    }

    static bool ReadExposures(JsonElement root, ParsedSceneDocument result, out string problem)
    {
        problem = string.Empty;
        if (!root.TryGetProperty("exposures", out var items) || items.ValueKind != JsonValueKind.Array)
        {
            problem = "'exposures' is missing or is not a list";
            return false;
        }

        foreach (var item in items.EnumerateArray())
        {
            var owner = JsonData.String(item, "owner");
            if (owner is null)
            {
                problem = "an exposure has no owner";
                return false;
            }

            result.Exposures.TryAdd(owner, new ExposureEntry(owner, item.Clone(), Read<ExposureDeclaration>(item)));
        }

        return true;
    }

    static bool ReadContributions(JsonElement root, ParsedSceneDocument result, out string problem)
    {
        problem = string.Empty;
        if (!root.TryGetProperty("instanceContributions", out var items) || items.ValueKind != JsonValueKind.Array)
        {
            problem = "'instanceContributions' is missing or is not a list";
            return false;
        }

        foreach (var item in items.EnumerateArray())
        {
            var (instance, component, path) = (JsonData.String(item, "instance"), JsonData.String(item, "component"), JsonData.String(item, "path"));
            if (instance is null || component is null || path is null)
            {
                problem = "a contribution is missing its instance, component or path";
                return false;
            }

            result.Contributions.Add(new ContributionEntry(instance, component, path, item.Clone(), Read<InstanceContribution>(item)));
        }

        return true;
    }

    static T? Read<T>(JsonElement element)
        where T : class
    {
        try
        {
            return element.Deserialize<T>(_options);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
