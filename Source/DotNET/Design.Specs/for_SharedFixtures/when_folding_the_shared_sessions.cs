// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.for_SharedFixtures;

/// <summary>
/// Folds the events of every session case of scene-design-fixtures.json, and seeds sessions from sessions, and checks the sessions are the ones the TypeScript package gave.
/// </summary>
public class when_folding_the_shared_sessions : Specification
{
    List<string> _mismatches = null!;
    int _checked;

    void Because()
    {
        _mismatches = [];
        foreach (var fixture in DesignCorpus.Cases("sessions"))
        {
            _checked++;
            var session = DesignSessionReducer.FoldAll(fixture["events"]!.AsArray().Select(node => DesignSessionEvents.Parse(JsonSerializer.SerializeToElement(node))));
            Compare(fixture["name"]!.GetValue<string>(), DesignCorpus.Write(session), fixture["expected"]);
        }

        foreach (var fixture in DesignCorpus.Cases("seeds"))
        {
            _checked++;
            var source = fixture["source"].Deserialize<DesignSession>(DesignJson.Options)!;
            var seed = fixture["seed"].Deserialize<DesignSessionSeed>(DesignJson.Options)!;
            var events = DesignSessions.Seed(source, seed);
            var name = fixture["name"]!.GetValue<string>();
            Compare(name, DesignCorpus.Write(events.Select(Described).ToList()), fixture["expectedEvents"]);
            Compare(name, DesignCorpus.Write(DesignSessionReducer.FoldAll(events)), fixture["expected"]);
        }
    }

    [Fact] void should_check_every_case() => _checked.ShouldBeGreaterThan(20);

    [Fact] void should_give_the_sessions_the_typescript_package_gave() => _mismatches.ShouldBeEmpty();

    /// <summary>
    /// Writes an event the way the TypeScript package names it: by its type, and without the optional facts an event leaves empty - a Chronicle
    /// event carries no nulls, so an empty text or list is an absent one.
    /// </summary>
    /// <param name="event">The event.</param>
    /// <returns>The JSON.</returns>
    static JsonObject Described(object @event)
    {
        var node = JsonSerializer.SerializeToNode(@event, @event.GetType(), DesignJson.Options)!.AsObject();
        var described = new JsonObject { ["type"] = @event.GetType().Name };
        foreach (var (key, value) in node)
        {
            var emptyText = value is JsonValue text && text.TryGetValue<string>(out var content) && content.Length == 0;
            var emptyList = value is JsonArray { Count: 0 } && key != "operations";
            var empty = emptyText || emptyList;
            if (!empty)
            {
                described[key] = value?.DeepClone();
            }
        }

        return described;
    }

    void Compare(string name, JsonNode? actual, JsonNode? expected)
    {
        var difference = DesignCorpus.FirstDifference(actual, expected);
        if (difference is not null)
        {
            _mismatches.Add($"{name} at {difference}");
        }
    }
}
