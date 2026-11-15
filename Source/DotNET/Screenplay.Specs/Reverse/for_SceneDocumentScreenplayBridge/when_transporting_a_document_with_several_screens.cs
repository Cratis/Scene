// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

public class when_transporting_a_document_with_several_screens : given.a_scene_document_transport
{
    const string Document = """
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],
          "dialogTemplates":[],
          "screens":[
            {"name":"Screen","layout":"StudioScreen",
             "slotContent":{"content":[{"id":"open-details","name":"Open details","componentName":"core:button","properties":{"label":"Details"},"slots":{},
               "behaviors":[{"bindings":[{"trigger":{"kind":"Click"},"actions":[{"kind":"Navigate","screen":"Details"}]}]}]}]},
             "forms":[],"contributions":[]},
            {"name":"Details","layout":"StudioScreen",
             "slotContent":{"content":[{"id":"details-text","name":"Details text","componentName":"core:text","properties":{"text":"More"},"slots":{},
               "behaviors":[{"bindings":[{"trigger":{"kind":"Click"},"actions":[{"kind":"Navigate","screen":"Screen"}]}]}]}]},
             "forms":[],"contributions":[]}
          ],
          "exposures":[],
          "instanceContributions":[]
        }
        """;

    void Because() => Transport((Guid.NewGuid().ToString(), "Admin", Document));

    [Fact] void should_have_no_export_warnings() => _warnings.ShouldBeEmpty();
    [Fact] void should_not_use_the_preservation_carrier() => _source.ShouldNotContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_plan_the_primary_screen_under_the_role_name() => PlannedElement("Admin", "open-details").ShouldNotBeNull();
    [Fact] void should_plan_the_other_screen_under_the_role_and_its_own_name() => PlannedElement("Admin__Details", "details-text").ShouldNotBeNull();
    [Fact] void should_navigate_to_the_other_screen_by_its_screenplay_name() =>
        ((NavigateAction)PlannedElement("Admin", "open-details").Behaviors.Single().Bindings.Single().Actions.Single()).Screen.ShouldEqual("Admin__Details");
    [Fact] void should_reopen_one_document() => _import.CustomCode.Screens.Count.ShouldEqual(1);
    [Fact] void should_reopen_both_screens_in_the_document() => FirstDifference(Document, Reopened("Admin").Document).ShouldBeNull();
}
