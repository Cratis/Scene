// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Slots.for_SlotShape;

/// <summary>
/// The TypeScript twin writes 'undefined' where C# writes 'null' for a missing id: Cratis/Scene#299.
/// </summary>
public class when_validating_elements_without_an_id : Specification
{
    const string Document = """{"slotContent":{"main":[{"componentName":"x:action","properties":{"opens":"nope"}},{"kind":"button","display":"bad"},{"componentName":"core:action","properties":{"presentation":"modal"}}]}}""";

    string[] _messages = null!;

    void Because() => _messages = SlotShapeValidator.Validate(JsonNode.Parse(Document))
        .Select(diagnostic => diagnostic.Message.Split(';')[0].Split(". Scene 5")[0])
        .ToArray();

    [Fact]
    void should_name_the_missing_id_as_null() => _messages.ShouldEqual(
    [
        "The action 'null' opens 'nope'",
        "The button 'null' shows 'bad'",
        "The action 'null' stores a presentation",
    ]);
}
