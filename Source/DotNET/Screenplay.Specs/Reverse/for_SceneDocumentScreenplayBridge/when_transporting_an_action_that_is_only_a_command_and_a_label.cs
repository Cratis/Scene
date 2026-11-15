// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// An `action RenameWorkItem` line imports as a core action under the name of its command, and exports as that line again - not as
// the long `component core.action` form with an id and a property for each of its two members. An action that says more stays long.
public class when_transporting_an_action_that_is_only_a_command_and_a_label : given.a_scene_document_transport
{
    const string Frame = """
        "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
        "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch"
        """;

    static string Document => $$$"""
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],"dialogTemplates":[],
          "screens":[{
            "name":"Screen","layout":"StudioScreen",
            "slotContent":{"content":[
              {"id":"RenameWorkItem","name":"RenameWorkItem","componentName":"core:action",{{{Frame}}},"properties":{"command":"RenameWorkItem","label":"Rename"},"slots":{}},
              {"id":"AddComment","name":"AddComment","componentName":"core:action",{{{Frame}}},"properties":{"command":"AddComment","label":null},"slots":{}},
              {"id":"closer","name":"closer","componentName":"core:action",{{{Frame}}},"properties":{"command":"CloseWorkItem","label":"Close","variant":"danger"},"slots":{}}
            ]},
            "forms":[],"contributions":[]
          }],
          "exposures":[],"instanceContributions":[]
        }
        """;

    void Because() => Transport((Guid.NewGuid().ToString(), "Admin", Document));

    [Fact] void should_write_the_action_line() => _source.ShouldContain("action RenameWorkItem");
    [Fact] void should_write_its_label() => _source.ShouldContain("label \"Rename\"");
    [Fact] void should_not_write_the_long_form_of_that_action() => _source.ShouldNotContain("component core.action RenameWorkItem");
    [Fact] void should_write_the_action_line_of_an_action_without_a_label() => _source.ShouldContain("action AddComment");
    [Fact] void should_not_write_a_label_it_does_not_have() => _source.ShouldNotContain("component core.action AddComment");
    [Fact] void should_keep_an_action_that_says_more_in_the_long_form() => _source.ShouldContain("component core.action closer");
    [Fact] void should_plan_both_actions() => PlannedElements("Admin").Select(element => element.Properties["command"]).ShouldContain(["RenameWorkItem", "CloseWorkItem"]);
    [Fact] void should_reopen_the_action_under_the_id_of_its_command() => _import.CustomCode.Screens.Single().Document.ShouldContain("\"id\":\"RenameWorkItem\"");
}
