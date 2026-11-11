// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Guards;

namespace Cratis.Scene.Engine.for_GuardConditionText;

public class when_running_the_shared_corpus : Specification
{
    JsonElement _corpus;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx"))) directory = directory.Parent;
        _corpus = JsonElement.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "guard-condition-text-fixtures.json")));
    }

    [Fact]
    void should_parse_every_shared_condition_to_the_same_serialized_form()
    {
        var failures = new List<string>();
        foreach (var entry in _corpus.GetProperty("parse").EnumerateArray())
        {
            var parsed = GuardConditionText.Parse(entry.GetProperty("text").GetString()!);
            var actual = parsed is { } element ? element.GetRawText() : "null";
            var expected = JsonSerializer.Serialize(entry.GetProperty("expected"));
            if (actual != expected) failures.Add($"{entry.GetProperty("name").GetString()}: expected {expected} but was {actual}");
        }

        failures.ShouldBeEmpty();
    }

    [Fact]
    void should_describe_every_shared_condition_as_the_same_text()
    {
        var failures = new List<string>();
        foreach (var entry in _corpus.GetProperty("describe").EnumerateArray())
        {
            var actual = GuardConditionText.Describe(entry.GetProperty("condition"));
            var expected = entry.GetProperty("text").GetString();
            if (actual != expected) failures.Add($"{entry.GetProperty("name").GetString()}: expected {expected} but was {actual}");
        }

        failures.ShouldBeEmpty();
    }
}
