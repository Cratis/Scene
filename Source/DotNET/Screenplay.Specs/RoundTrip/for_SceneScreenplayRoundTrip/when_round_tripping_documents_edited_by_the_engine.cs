// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Editing.Applying;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Queries;
using Cratis.Scene.Screenplay.Reverse;
using Cratis.Scene.Screenplay.Reverse.given;
using SceneJson = Cratis.Scene.Model.SceneJson;

namespace Cratis.Scene.Screenplay.RoundTrip.for_SceneScreenplayRoundTrip;

/// <summary>
/// Takes every document of the shared edit corpus, applies the edits of every case with the engine, prints the edited document as Screenplay,
/// reads the Screenplay back as Scene and asks whether it is the document the engine produced.
/// </summary>
/// <remarks>
/// The corpus documents use layouts and templates of their own rather than the editor's screen layout, which typed Screenplay cannot name for a screen,
/// so they travel on the preservation carrier - exactly - and say so in the warnings. The document that comes back is the one that went in (Screenplay
/// decision 0013: what a realization cannot recover is reported, never passed silently). The typed path is the next spec's.
/// </remarks>
public class when_round_tripping_documents_edited_by_the_engine : Specification
{
    List<string> _different = null!;
    int _documents;

    void Because()
    {
        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "scene-edit-fixtures.json")))!.AsObject();
        var catalog = DescriptorCatalog.Create(corpus["components"].Deserialize<List<ComponentDescriptor>>(SceneJson.Options));
        var documents = corpus["documents"]!.AsObject();
        _different = [];

        foreach (var fixtureCase in corpus["cases"]!.AsArray().Select(node => node!.AsObject()))
        {
            var name = fixtureCase["name"]!.GetValue<string>();
            var document = documents[fixtureCase["document"]!.GetValue<string>()]!.Deserialize<SceneDocument>(SceneJson.Options)!;
            var context = new EditingContext(
                catalog,
                fixtureCase["scope"].Deserialize<EditingScope>(SceneJson.Options)!,
                fixtureCase["queryCandidates"].Deserialize<List<QueryCandidate>>(SceneJson.Options));

            foreach (var step in fixtureCase["steps"]!.AsArray().Select(node => node!.AsObject()))
            {
                document = EditApplier.Apply(document, step["edit"].Deserialize<SceneEdit>(SceneJson.Options)!, context).Model;
            }

            var edited = JsonSerializer.SerializeToNode(document, SceneJson.Options)!.ToJsonString();
            _documents++;
            var printed = DocumentTransport.Export([("actor", "UI", edited)]);
            var reopened = DocumentTransport.Import(printed.Source);
            var returned = reopened.CustomCode.Screens.FirstOrDefault(screen => screen.RoleName == "UI" || screen.RoleName is null);
            if (returned is null)
            {
                _different.Add($"{name}: nothing came back from\n{printed.Source}");
                continue;
            }

            if (!SceneDocumentCanonicalForm.AreEquivalent(edited, returned.Document))
            {
                _different.Add($"{name}: {SceneDocumentCanonicalForm.FirstDifference(JsonNode.Parse(edited), JsonNode.Parse(returned.Document))}");
            }
        }
    }

    [Fact] void should_round_trip_every_document_of_the_corpus() => _documents.ShouldBeGreaterThan(100);

    [Fact] void should_bring_back_the_document_the_engine_produced() => _different.ShouldBeEmpty();

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
