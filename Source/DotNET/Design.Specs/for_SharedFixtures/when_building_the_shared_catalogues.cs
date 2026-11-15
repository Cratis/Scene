// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.for_SharedFixtures;

/// <summary>
/// Builds every catalogue of scene-design-fixtures.json and answers every question about them, and checks the answers are the ones the TypeScript package gave.
/// </summary>
public class when_building_the_shared_catalogues : Specification
{
    List<string> _mismatches = null!;
    int _checked;

    void Because()
    {
        _mismatches = [];
        foreach (var fixture in DesignCorpus.Cases("catalogues"))
        {
            _checked++;
            var actual = DesignCorpus.Write(DesignCatalogueBuilder.Build(DesignCorpus.Input(fixture["input"]!.GetValue<string>())));
            Compare(fixture["name"]!.GetValue<string>(), actual, fixture["expected"]);
        }

        foreach (var fixture in DesignCorpus.Cases("questions"))
        {
            _checked++;
            var catalogue = DesignCatalogueBuilder.Build(DesignCorpus.Input(fixture["input"]!.GetValue<string>()));
            var query = fixture["query"].Deserialize<DesignCatalogueQuery>(DesignJson.Options)!;
            Compare(fixture["name"]!.GetValue<string>(), DesignCorpus.Write(DesignCatalogueQueries.Answer(catalogue, query)), fixture["expected"]);
        }
    }

    [Fact] void should_check_every_case() => _checked.ShouldBeGreaterThan(29);

    [Fact] void should_give_the_answers_the_typescript_package_gave() => _mismatches.ShouldBeEmpty();

    void Compare(string name, JsonNode? actual, JsonNode? expected)
    {
        var difference = DesignCorpus.FirstDifference(actual, expected);
        if (difference is not null)
        {
            _mismatches.Add($"{name} at {difference}");
        }
    }
}
