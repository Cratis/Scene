// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.ScreenSets;

namespace Cratis.Scene.Design.for_SharedFixtures;

/// <summary>
/// Changes the screen sets of scene-design-fixtures.json step by step and finds the links between their screens, and checks the results are the ones the TypeScript package gave.
/// </summary>
public class when_changing_the_shared_screen_sets : Specification
{
    List<string> _mismatches = null!;
    int _checked;

    void Because()
    {
        _mismatches = [];
        foreach (var fixture in DesignCorpus.Cases("screenSets"))
        {
            _checked++;
            var set = ScreenSet.Create(fixture["initial"].Deserialize<List<string>>());
            foreach (var step in fixture["steps"]!.AsArray().Select(node => node!.AsObject()))
            {
                var name = step["name"]?.GetValue<string>() ?? string.Empty;
                set = step["fn"]!.GetValue<string>() switch
                {
                    "add" => set.AddScreen(name, step["index"]?.GetValue<int>()),
                    "remove" => set.RemoveScreen(name),
                    "move" => set.MoveScreen(name, step["index"]!.GetValue<int>()),
                    _ => set.WithStoryline(step["storyline"].Deserialize<Storyline>(DesignJson.Options)!),
                };
            }

            Compare(fixture["name"]!.GetValue<string>(), DesignCorpus.Write(set), fixture["expected"]);
        }

        foreach (var fixture in DesignCorpus.Cases("screenLinks"))
        {
            _checked++;
            var workspace = DesignCorpus.Workspace(fixture["workspace"]!.GetValue<string>());
            if (fixture["afterOperations"] is { } after)
            {
                workspace = DesignOperations.Apply(workspace, after.Deserialize<List<DesignOperation>>(DesignJson.Options)!, DesignContext.Create(DesignCorpus.Input("base"))).Workspace;
            }

            var actual = new JsonObject
            {
                ["links"] = DesignCorpus.Write(ScreenLinks.Find(workspace.Document)),
                ["dangling"] = DesignCorpus.Write(ScreenLinks.FindDangling(workspace.Document, workspace.ScreenSet)),
                ["unreached"] = DesignCorpus.Write(ScreenLinks.FindUnreached(workspace.Document, workspace.ScreenSet)),
            };
            Compare(fixture["name"]!.GetValue<string>(), actual, fixture["expected"]);
        }
    }

    [Fact] void should_check_every_case() => _checked.ShouldBeGreaterThan(9);

    [Fact] void should_give_the_results_the_typescript_package_gave() => _mismatches.ShouldBeEmpty();

    void Compare(string name, JsonNode? actual, JsonNode? expected)
    {
        var difference = DesignCorpus.FirstDifference(actual, expected);
        if (difference is not null)
        {
            _mismatches.Add($"{name} at {difference}");
        }
    }
}
