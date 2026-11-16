// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.for_SharedFixtures;

/// <summary>
/// Applies every operation case of scene-design-fixtures.json, and checks the outcome of each operation - applied or refused, the reason, the alternatives, the diagnostics and the Scene edits it lowered to - and the workspace after, are the ones the TypeScript package gave.
/// </summary>
public class when_applying_the_shared_operations : Specification
{
    List<string> _mismatches = null!;
    int _cases;

    void Because()
    {
        _mismatches = [];
        foreach (var fixture in DesignCorpus.Cases("operations"))
        {
            _cases++;
            var name = fixture["name"]!.GetValue<string>();
            var input = fixture["input"]!.GetValue<string>();
            var start = DesignCorpus.Workspace(fixture["workspace"]!.GetValue<string>());
            var operations = fixture["operations"].Deserialize<List<DesignOperation>>(DesignJson.Options)!;
            var result = DesignOperations.Apply(start, operations, DesignContext.Create(DesignCorpus.Input(input)));

            var expected = fixture["expected"]!.AsObject();
            var actual = DesignCorpus.Write(result)!.AsObject();
            if (expected["workspaceUnchanged"]?.GetValue<bool>() == true)
            {
                if (!JsonNode.DeepEquals(DesignCorpus.Write(result.Workspace), DesignCorpus.Write(start)))
                {
                    _mismatches.Add($"{name}: the workspace changed, expected it unchanged");
                }

                actual.Remove("workspace");
                expected = (JsonObject)expected.DeepClone();
                expected.Remove("workspaceUnchanged");
            }

            Compare(name, actual, expected);
        }

        foreach (var fixture in DesignCorpus.Cases("variationChoices"))
        {
            _cases++;
            var context = DesignContext.Create(DesignCorpus.Input(fixture["input"]!.GetValue<string>()));
            var workspace = DesignCorpus.Workspace(fixture["workspace"]!.GetValue<string>());
            var offered = DesignOperations.Apply(workspace, [new VariationsOperation(fixture["screen"]!.GetValue<string>(), [fixture["template"]!.GetValue<string>()])], context);
            var chosen = DesignVariations.Choose(workspace, context, offered.Outcomes[0].Variations![0]);
            Compare(fixture["name"]!.GetValue<string>(), DesignCorpus.Write(chosen), fixture["expected"]);
        }

        foreach (var fixture in DesignCorpus.Corpus["tweaks"]!["lowered"]!.AsArray().Select(node => node!.AsObject()))
        {
            _cases++;
            var control = fixture["control"].Deserialize<TweakControl>(DesignJson.Options)!;
            Compare(fixture["name"]!.GetValue<string>(), DesignCorpus.Write(DesignTweaks.Lower(control, fixture["value"]!.GetValue<string>())), fixture["expected"]);
        }

        var resolved = DesignCorpus.Corpus["tweaks"]!["resolved"]!.AsObject();
        var controls = resolved["controls"].Deserialize<List<TweakControl>>(DesignJson.Options)!;
        _cases++;
        Compare(
            "resolves tweak controls against the design",
            DesignCorpus.Write(DesignTweaks.ResolveAll(controls, DesignCorpus.Workspace(resolved["workspace"]!.GetValue<string>()), DesignContext.Create(DesignCorpus.Input(resolved["input"]!.GetValue<string>())))),
            resolved["expected"]);
    }

    [Fact] void should_apply_every_case() => _cases.ShouldBeGreaterThan(80);

    [Fact] void should_give_the_outcomes_the_typescript_package_gave() => _mismatches.ShouldBeEmpty();

    void Compare(string name, JsonNode? actual, JsonNode? expected)
    {
        var difference = DesignCorpus.FirstDifference(actual, expected);
        if (difference is not null)
        {
            _mismatches.Add($"{name} at {difference}");
        }
    }
}
