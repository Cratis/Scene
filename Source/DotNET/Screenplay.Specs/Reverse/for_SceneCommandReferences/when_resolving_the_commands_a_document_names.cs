// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneCommandReferences;

public class when_resolving_the_commands_a_document_names : Specification
{
    static readonly Guid _known = Guid.NewGuid();
    static readonly Guid _unknown = Guid.NewGuid();

    JsonNode _resolved = null!;

    void Because()
    {
        var document = $$$"""
            {"screens":[{"slotContent":{"content":[
              {"id":"a","componentName":"core:action","properties":{"command":"{{{_known}}}"}},
              {"id":"b","componentName":"commandForm","properties":{"command":"{{{_known}}}"}},
              {"id":"c","componentName":"Cratis.Components:commandForm","properties":{"command":"{{{_known}}}"},"slots":{"x":[{"id":"d","componentName":"core.action","properties":{"command":"{{{_known}}}"}}]}},
              {"id":"e","componentName":"core:action","properties":{"command":"{{{_unknown}}}"}},
              {"id":"f","componentName":"core:action","properties":{"command":"AlreadyAName"}},
              {"id":"g","componentName":"core:title","properties":{"command":"{{{_known}}}"}}
            ]}}]}
            """;
        _resolved = JsonNode.Parse(SceneCommandReferences.Resolve(document, new Dictionary<Guid, string> { [_known] = "RegisterOrder" }));
    }

    string CommandOf(string id) => Elements().Single(element => element["id"].GetValue<string>() == id)["properties"]["command"].GetValue<string>();

    IEnumerable<JsonNode> Elements() => Walk(_resolved).Where(node => node is JsonObject json && json.ContainsKey("componentName"));

    static IEnumerable<JsonNode> Walk(JsonNode node) => node switch
    {
        JsonObject json => json.SelectMany(member => member.Value is null ? [] : Walk(member.Value)).Prepend(json),
        JsonArray array => array.SelectMany(item => item is null ? [] : Walk(item)),
        _ => []
    };

    [Fact] void should_name_the_command_of_an_action() => CommandOf("a").ShouldEqual("RegisterOrder");
    [Fact] void should_name_the_command_of_a_command_form() => CommandOf("b").ShouldEqual("RegisterOrder");
    [Fact] void should_name_the_command_of_a_qualified_command_form() => CommandOf("c").ShouldEqual("RegisterOrder");
    [Fact] void should_name_the_command_of_an_element_inside_a_slot() => CommandOf("d").ShouldEqual("RegisterOrder");
    [Fact] void should_leave_a_slice_the_board_does_not_have() => CommandOf("e").ShouldEqual(_unknown.ToString());
    [Fact] void should_leave_a_name_as_it_is() => CommandOf("f").ShouldEqual("AlreadyAName");
    [Fact] void should_leave_a_component_that_names_no_command() => CommandOf("g").ShouldEqual(_known.ToString());
}
