// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_ScreenDocumentCorpus;

// The committed corpus is what the bridge produces, and nothing else. Setting SCENE_SCREENPLAY_CORPUS_OUTPUT
// writes it instead of asserting it - that is how `node generate-screenplay-scene-document-fixtures.mjs`
// regenerates it, so the file is never hand-edited.
public class when_generating_the_shared_corpus : Specification
{
    public const string OutputVariable = "SCENE_SCREENPLAY_CORPUS_OUTPUT";

    JsonObject _generated = null!;
    string? _written;

    void Establish() => _written = Environment.GetEnvironmentVariable(OutputVariable);

    void Because()
    {
        _generated = ScreenDocumentCorpus.Generate();
        if (!string.IsNullOrWhiteSpace(_written))
        {
            File.WriteAllText(_written, _generated.ToJsonString(ScreenDocumentCorpus.Options) + Environment.NewLine);
        }
    }

    [Fact] void should_cover_every_case() => ((JsonArray)_generated["cases"]!).Count.ShouldEqual(ScreenDocumentCorpusCases.All.Count + ScreenDocumentCorpusCases.Printed().Count());

    [Fact] void should_produce_a_document_for_every_case() =>
        ((JsonArray)_generated["cases"]!)
            .Select(each => ((JsonArray)each!["slices"]!).Sum(slice => ((JsonArray)slice!["documents"]!).Count))
            .ShouldEachConformTo(documents => documents > 0);

    [Fact] void should_match_what_is_committed()
    {
        if (!string.IsNullOrWhiteSpace(_written))
        {
            return;
        }

        var committed = File.ReadAllText(CorpusFile.Path);
        Canonical(JsonNode.Parse(committed)!).ShouldEqual(Canonical(_generated));
    }

    static string Canonical(JsonNode node) => node.ToJsonString(ScreenDocumentCorpus.Options);
}
