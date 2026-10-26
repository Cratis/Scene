// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Guards;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Model.for_SceneModelShape;

public class when_round_tripping_a_guarded_action : Specification
{
    const string StageProperties = """
        {"label":"Approve","alternatives":[{"command":"Approve","condition":{"kind":"logical","operator":"And","left":{"kind":"comparison","left":{"subject":"item.status"},"operator":"Equal","right":"Pending","enumeration":["Pending","Approved"]},"right":{"kind":"comparison","left":{"subject":"item.amount"},"operator":"GreaterThan","right":0}},"arguments":{"id":{"subject":"item.id"}}}],"item":{"kind":"componentProperty","componentId":"orders","componentPropertyPath":"selectedItem","path":"selectedItem"},"otherwise":{"outcome":"Hidden"},"navigateToScreen":"detail","navigateByParameter":"id"}
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

    [Fact] void should_preserve_the_command() => _roundTrip.Alternatives[0].Command.ShouldEqual("Approve");
    [Fact] void should_preserve_the_subject_binding() => _roundTrip.Item!.ComponentId.ShouldEqual("orders");
    [Fact] void should_preserve_explicit_arguments() => _roundTrip.Alternatives[0].Arguments!["id"].Subject.ShouldEqual("item.id");
    [Fact] void should_preserve_the_nested_guard() => _roundTrip.Alternatives[0].Condition.ShouldBeOfExactType<LogicalGuardCondition>();
    [Fact] void should_preserve_interaction_branches() => _interaction.GetProperty("alternatives").GetArrayLength().ShouldEqual(1);
    [Fact] void should_preserve_an_empty_fallback() => _interaction.GetProperty("otherwise").GetArrayLength().ShouldEqual(0);
}
