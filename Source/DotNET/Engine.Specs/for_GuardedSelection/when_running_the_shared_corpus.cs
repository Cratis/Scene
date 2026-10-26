// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Guards;
using Cratis.Scene.Model.Guards;

namespace Cratis.Scene.Engine.for_GuardedSelection;

public class when_running_the_shared_corpus : Specification
{
    JsonElement _corpus;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx"))) directory = directory.Parent;
        _corpus = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "guarded-selection-fixtures.json"))).RootElement;
    }

    [Fact]
    void should_preserve_present_nulls_when_evaluating_a_typed_guard()
    {
        var condition = new ComparisonGuardCondition(new("item.value"), GuardOperator.Equal, null);
        GuardConditions.Evaluate(condition, new { value = (string?)null }).ShouldEqual(true);
    }

    [Fact]
    void should_evaluate_a_typed_enum_comparison()
    {
        var condition = new ComparisonGuardCondition(new("item.status"), GuardOperator.Equal, "approved", ["Pending", "Approved"]);
        GuardConditions.Evaluate(condition, new { status = 1 }).ShouldEqual(true);
    }

    [Fact]
    void should_evaluate_every_shared_predicate()
    {
        foreach (var entry in _corpus.GetProperty("cases").EnumerateArray())
        {
            var condition = entry.GetProperty("condition");
            GuardConditions.CanEvaluate(condition).ShouldEqual(entry.GetProperty("evaluable").GetBoolean());
            var expected = entry.GetProperty("result");
            GuardConditions.Evaluate(condition, entry.GetProperty("item")).ShouldEqual(expected.ValueKind == JsonValueKind.Null ? null : expected.GetBoolean());
        }
    }

    [Fact]
    void should_select_every_shared_interaction()
    {
        foreach (var entry in _corpus.GetProperty("interactions").EnumerateArray())
        {
            var selection = GuardedSelection.SelectInteraction(entry.GetProperty("alternatives"), entry.GetProperty("item"), entry.GetProperty("hasOtherwise").GetBoolean());
            selection.Kind.ShouldEqual(entry.GetProperty("expected").GetProperty("kind").GetString());
        }
    }

    [Fact]
    void should_select_every_shared_branch()
    {
        foreach (var entry in _corpus.GetProperty("selections").EnumerateArray())
        {
            entry.TryGetProperty("otherwise", out var otherwise);
            var selected = GuardedSelection.SelectAction(entry.GetProperty("alternatives"), entry.GetProperty("item"), otherwise);
            var expected = entry.GetProperty("expected");
            selected.Kind.ShouldEqual(expected.GetProperty("kind").GetString());
            selected.Index.ShouldEqual(expected.TryGetProperty("index", out var index) ? index.GetInt32() : null);
        }
    }
}
