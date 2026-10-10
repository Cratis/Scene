// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Bindings.for_ArgumentSources;

public class when_resolving_the_shared_corpus : Specification
{
    JsonObject _corpus = null!;
    List<(string Source, string Actual, string Expected)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "argument-source-fixtures.json")))!.AsObject();
    }

    void Because()
    {
        var scopeNode = _corpus["scope"]!;
        var scope = new BindingScope(
            scopeNode["dataContext"]?.DeepClone(),
            ComponentOutputs: scopeNode["componentOutputs"]!.AsObject().ToDictionary(entry => entry.Key, entry => entry.Value!.DeepClone().AsObject()));

        _results = [.. _corpus["cases"]!.AsArray().Select(node =>
        {
            var source = node!["source"]!.GetValue<string>();
            var value = ArgumentSources.Resolve(source, scope);
            var actual = value.IsAbsent ? "absent" : value.Node?.ToJsonString() ?? "null";
            var expected = node["expectedAbsent"] is not null ? "absent" : node["expected"]?.ToJsonString() ?? "null";
            return (source, actual, expected);
        })];
    }

    [Fact]
    void should_resolve_every_source() => _results.Count.ShouldEqual(16);

    [Fact]
    void should_resolve_like_the_typescript_engine()
    {
        foreach (var (source, actual, expected) in _results)
        {
            (source, actual).ShouldEqual((source, expected));
        }
    }
}
