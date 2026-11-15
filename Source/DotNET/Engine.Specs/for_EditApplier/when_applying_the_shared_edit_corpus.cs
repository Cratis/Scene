// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Editing.Applying;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Engine.Editing.Applying.for_EditApplier;

/// <summary>
/// Applies every case of scene-edit-fixtures.json, which the TypeScript engine produced and its own spec asserts too, and checks the
/// outcome of every edit - applied or refused, the diagnostics, and the document after it - is the one the TypeScript engine gave.
/// </summary>
public class when_applying_the_shared_edit_corpus : Specification
{
    List<string> _mismatches = null!;
    int _cases;
    int _edits;

    void Because()
    {
        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "scene-edit-fixtures.json")))!.AsObject();
        var catalog = DescriptorCatalog.Create(corpus["components"].Deserialize<List<ComponentDescriptor>>(SceneJson.Options));
        var documents = corpus["documents"]!.AsObject();
        _mismatches = [];

        foreach (var fixtureCase in corpus["cases"]!.AsArray().Select(node => node!.AsObject()))
        {
            _cases++;
            var name = fixtureCase["name"]!.GetValue<string>();
            var document = documents[fixtureCase["document"]!.GetValue<string>()]!.Deserialize<SceneDocument>(SceneJson.Options)!;
            var context = new EditingContext(
                catalog,
                fixtureCase["scope"].Deserialize<EditingScope>(SceneJson.Options)!,
                fixtureCase["queryCandidates"].Deserialize<List<QueryCandidate>>(SceneJson.Options));

            foreach (var step in fixtureCase["steps"]!.AsArray().Select(node => node!.AsObject()))
            {
                _edits++;
                var edit = step["edit"].Deserialize<SceneEdit>(SceneJson.Options)!;
                var outcome = EditApplier.Apply(document, edit, context);

                if (outcome.Applied != step["applied"]!.GetValue<bool>())
                {
                    _mismatches.Add($"{name}: applied {outcome.Applied}, expected {step["applied"]}");
                }

                var actual = JsonSerializer.SerializeToNode(outcome.Diagnostics, SceneJson.Options)!;
                if (!JsonNode.DeepEquals(actual, step["diagnostics"]))
                {
                    _mismatches.Add($"{name}: diagnostics {actual.ToJsonString()}, expected {step["diagnostics"]!.ToJsonString()}");
                }

                if (!outcome.Applied && !ReferenceEquals(outcome.Model, document))
                {
                    _mismatches.Add($"{name}: a refused edit must hand back the document it was given");
                }

                document = outcome.Model;
            }

            var finalDocument = JsonSerializer.SerializeToNode(document, SceneJson.Options);
            if (!JsonNode.DeepEquals(finalDocument, fixtureCase["expectedDocument"]))
            {
                _mismatches.Add($"{name}: document {finalDocument!.ToJsonString()}, expected {fixtureCase["expectedDocument"]!.ToJsonString()}");
            }
        }
    }

    [Fact] void should_apply_cases() => _cases.ShouldBeGreaterThan(100);

    [Fact] void should_apply_every_kind_of_edit() => _edits.ShouldBeGreaterThan(_cases);

    [Fact] void should_give_the_outcome_the_typescript_engine_gave_for_every_case() => _mismatches.ShouldBeEmpty();

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Could not find the repository root (Scene.slnx).");
    }
}
