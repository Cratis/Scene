// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Guards;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Model.for_GuardedActionProperties;

public class when_round_tripping_stage_properties : Specification
{
    const string StageProperties = """
        {"label":"Approve","alternatives":[{"command":"Approve","condition":{"kind":"logical","operator":"And","left":{"kind":"comparison","left":{"subject":"item.status"},"operator":"Equal","right":"Pending","enumeration":["Pending","Approved"]},"right":{"kind":"comparison","left":{"subject":"item.amount"},"operator":"GreaterThan","right":0}},"arguments":{"id":{"subject":"item.id"}}}],"otherwise":{"outcome":"Hidden"},"navigateToScreen":"detail","navigateByParameter":"id"}
        """;
    readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web);
    GuardedActionProperties _properties = null!;
    GuardedActionProperties _roundTrip = null!;
    JsonElement _interaction;

    void Establish()
    {
        var bag = JsonSerializer.Deserialize<Dictionary<string, object?>>(StageProperties, _options)!;
        _properties = GuardedActionProperties.Read(new ExternalComponent { Id = "approve", Name = "approve", ComponentName = GuardedActionProperties.ComponentName, Properties = bag });
    }

    void Because()
    {
        _roundTrip = GuardedActionProperties.Read(new ExternalComponent { Id = "approve", Name = "approve", ComponentName = GuardedActionProperties.ComponentName, Properties = _properties.ToProperties() });
        var binding = new InteractionBinding(new BuiltInInteractionTrigger(InteractionTriggerKind.Click), [], Alternatives: [new(_properties.Alternatives[0].Condition, [])], Otherwise: []);
        _interaction = JsonSerializer.SerializeToElement(binding, _options);
    }

    [Fact]
    void should_preserve_a_null_literal_when_writing_the_property_bag()
    {
        var properties = new GuardedActionProperties("Check", [new("Check", new ComparisonGuardCondition(new("item.value"), GuardOperator.Equal, null))]);
        var json = JsonSerializer.SerializeToElement(properties.ToProperties(), _options);
        json.GetProperty("alternatives")[0].GetProperty("condition").GetProperty("right").ValueKind.ShouldEqual(JsonValueKind.Null);
    }

    [Fact]
    void should_write_canonical_guard_enumeration_values()
    {
        var properties = new GuardedActionProperties(
            "Close",
            [new("Close", new LogicalGuardCondition(new ComparisonGuardCondition(new("item.status"), GuardOperator.Equal, "Open"), LogicalGuardOperator.And, new ComparisonGuardCondition(new("item.amount"), GuardOperator.GreaterThan, 0)))],
            Otherwise: new(GuardedActionFallbackOutcome.Execute, "Cancel"));
        var json = JsonSerializer.SerializeToElement(properties.ToProperties(), _options);
        var condition = json.GetProperty("alternatives")[0].GetProperty("condition");
        condition.GetProperty("operator").GetString().ShouldEqual("And");
        condition.GetProperty("left").GetProperty("operator").GetString().ShouldEqual("Equal");
        json.GetProperty("otherwise").GetProperty("outcome").GetString().ShouldEqual("Execute");
    }

    [Fact] void should_preserve_the_command() => _roundTrip.Alternatives[0].Command.ShouldEqual("Approve");
    [Fact] void should_accept_stage_properties_without_a_subject_binding() => _roundTrip.Item.ShouldBeNull();
    [Fact] void should_preserve_explicit_arguments() => _roundTrip.Alternatives[0].Arguments!["id"].Subject.ShouldEqual("item.id");
    [Fact] void should_preserve_the_nested_guard() => _roundTrip.Alternatives[0].Condition.ShouldBeOfExactType<LogicalGuardCondition>();
    [Fact] void should_preserve_interaction_branches() => _interaction.GetProperty("alternatives").GetArrayLength().ShouldEqual(1);
    [Fact] void should_preserve_an_empty_fallback() => _interaction.GetProperty("otherwise").GetArrayLength().ShouldEqual(0);
}
