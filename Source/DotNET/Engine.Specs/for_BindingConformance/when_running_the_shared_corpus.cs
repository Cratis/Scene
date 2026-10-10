// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Bindings.for_BindingConformance;

public class when_running_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<(string Name, IReadOnlyList<string> Actual, IReadOnlyList<string> Expected)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "binding-resolution-fixtures.json")))!["scenarios"]!.AsArray();
    }

    JsonArray _corpus = null!;

    void Because() => _results = [.. _corpus.Select(scenario => (scenario!["name"]!.GetValue<string>(), Run(Scope(scenario["scope"]), scenario["steps"]!.AsArray()), Expectations(scenario["steps"]!.AsArray())))];

    [Fact]
    void should_run_every_scenario() => _results.Count.ShouldEqual(10);

    [Fact]
    void should_produce_the_same_results_as_the_typescript_engine()
    {
        foreach (var (name, actual, expected) in _results)
        {
            (name, string.Join('\n', actual)).ShouldEqual((name, string.Join('\n', expected)));
        }
    }

    static IReadOnlyList<string> Run(BindingScope scope, JsonArray steps)
    {
        var queries = new QueryBindingState();
        var tickets = new Dictionary<string, QueryBindingTicket>();
        BindingScope Effective() => scope with { QueryResults = Merge(scope.QueryResults, queries.QueryResults) };
        var lines = new List<string>();

        for (var index = 0; index < steps.Count; index++)
        {
            var step = steps[index]!.AsObject();
            var line = $"{index}: ok";
            if (step["nest"] is JsonNode nested)
            {
                scope = scope.Nest(Scope(nested));
            }
            else if (step["remove"] is JsonArray removed)
            {
                scope = scope.WithoutComponentOutputs(removed.Select(id => id!.GetValue<string>()));
            }
            else if (step["begin"] is JsonNode begin)
            {
                tickets[step["as"]!.GetValue<string>()] = queries.Begin(begin.GetValue<string>());
            }
            else if (step["complete"] is JsonNode complete)
            {
                line = $"{index}: accepted {(queries.Complete(tickets[complete.GetValue<string>()], step["result"]?.DeepClone()) ? "true" : "false")}";
            }
            else if (step["clear"] is JsonNode clear)
            {
                queries.Clear(clear.GetValue<string>());
            }
            else if (step["resolve"] is JsonNode resolve)
            {
                var value = BindingResolver.Resolve(Binding(resolve), Effective());
                line = $"{index}: {(value.IsAbsent ? "absent" : Json(value.Node))}";
            }
            else if (step["validate"] is JsonNode validate)
            {
                var diagnostics = BindingValidation.Validate(
                    Binding(validate),
                    Effective(),
                    step["targetElementId"]?.GetValue<string>(),
                    step["resolvingElementIds"]?.AsArray().Select(id => id!.GetValue<string>()).ToList());
                line = $"{index}: {Diagnostics(diagnostics.Select(diagnostic => (diagnostic.Code, diagnostic.Message, diagnostic.Path)))}";
            }

            lines.Add(line);
        }

        return lines;
    }

    static IReadOnlyList<string> Expectations(JsonArray steps) => [.. steps.Select((node, index) =>
    {
        var step = node!.AsObject();
        if (step.ContainsKey("complete")) return $"{index}: accepted {(step["accepted"]!.GetValue<bool>() ? "true" : "false")}";
        if (step.ContainsKey("resolve")) return $"{index}: {(step.ContainsKey("expectedAbsent") ? "absent" : Json(step["expected"]))}";
        if (step.ContainsKey("validate"))
        {
            return $"{index}: {Diagnostics(step["expectedDiagnostics"]!.AsArray().Select(diagnostic => (diagnostic!["code"]!.GetValue<string>(), diagnostic["message"]!.GetValue<string>(), diagnostic["path"]?.GetValue<string>())))}";
        }

        return $"{index}: ok";
    })];

    static BindingExpression Binding(JsonNode node) => node.Deserialize<BindingExpression>(_options)!;

    static BindingScope Scope(JsonNode? node) => new(
        node?["dataContext"]?.DeepClone(),
        node?["queryResults"]?.AsObject().ToDictionary(entry => entry.Key, entry => entry.Value?.DeepClone()),
        node?["componentOutputs"]?.AsObject().ToDictionary(entry => entry.Key, entry => entry.Value!.DeepClone().AsObject()));

    static Dictionary<string, JsonNode?> Merge(IReadOnlyDictionary<string, JsonNode?>? first, IReadOnlyDictionary<string, JsonNode?> second)
    {
        var merged = new Dictionary<string, JsonNode?>(first ?? new Dictionary<string, JsonNode?>());
        foreach (var (key, value) in second)
        {
            merged[key] = value;
        }

        return merged;
    }

    static string Json(JsonNode? node) => node?.ToJsonString() ?? "null";

    static string Diagnostics(IEnumerable<(string Code, string Message, string? Path)> diagnostics) =>
        string.Join(';', diagnostics.Select(diagnostic => $"{diagnostic.Code}|{diagnostic.Message}|{diagnostic.Path}"));
}
