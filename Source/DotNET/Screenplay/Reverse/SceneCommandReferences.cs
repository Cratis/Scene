// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The editor names the command an action or a command form submits by the id of its State Change slice - ids stay put when a name
/// changes or repeats - but a stage knows commands by name, and so does Screenplay: the module forms, the commands an action
/// executes and the routes the stage registers are all keyed by it. A document is read with each of those ids made the name of the
/// slice's command before anything is exported, so what is exported, planned and played names the command the board declares.
/// A name a document already carries - one read back from Screenplay - is left as it is.
/// </summary>
public static class SceneCommandReferences
{
    static readonly string[] _componentsThatNameACommand = ["action", "commandForm"];

    /// <summary>
    /// The document with every command it names by a slice id naming the command's name instead. The same text when it names none.
    /// </summary>
    public static string Resolve(string document, IReadOnlyDictionary<Guid, string> names)
    {
        if (names.Count == 0 || SceneJson.Parse(document) is not { } root)
        {
            return document;
        }

        return Resolve(root, names) ? root.ToJsonString(SceneJson.Options) : document;
    }

    static bool Resolve(JsonNode? node, IReadOnlyDictionary<Guid, string> names)
    {
        var changed = false;
        switch (node)
        {
            case JsonObject json:
                if (NamesACommand(json) && SceneJson.Object(json, "properties") is { } properties &&
                    SceneJson.String(properties, "command") is { } command && Guid.TryParse(command, out var id) && names.TryGetValue(id, out var name))
                {
                    properties["command"] = name;
                    changed = true;
                }

                foreach (var member in json.ToArray())
                {
                    changed |= Resolve(member.Value, names);
                }

                break;
            case JsonArray array:
                foreach (var item in array)
                {
                    changed |= Resolve(item, names);
                }

                break;
        }

        return changed;
    }

    static bool NamesACommand(JsonObject element) =>
        SceneJson.String(element, "componentName") is { } component && _componentsThatNameACommand.Contains(component[(component.LastIndexOfAny([':', '.']) + 1)..], StringComparer.Ordinal);
}
