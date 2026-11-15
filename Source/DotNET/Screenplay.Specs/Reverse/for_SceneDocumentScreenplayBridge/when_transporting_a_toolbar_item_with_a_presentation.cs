// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// StudioIssues#631: the presentation hints authored on a toolbar item travel Studio -> Screenplay -> Stage plan -> Studio.
public class when_transporting_a_toolbar_item_with_a_presentation : given.a_scene_document_with_a_toolbar_item
{
    void Because() => Transport((Guid.NewGuid().ToString(), "Sales", Document));

    string ReopenedDocument => Reopened("Sales").Document;

    [Fact] void should_write_the_presentation_among_the_properties_of_the_item() => string.Join('\n', _source.Split('\n').Select(line => line.Trim())).ShouldContain("property presentation\nmode = \"icon\"\nplacement = \"primary\"");
    [Fact] void should_plan_the_item_as_the_toolbar_item_of_the_core_package() => PlannedElement("Sales", "refresh-item").Properties["kind"].ShouldEqual("Action");
    [Fact] void should_plan_the_presentation_the_stage_hands_to_the_toolbar() => ((IDictionary<string, object?>)PlannedElement("Sales", "refresh-item").Properties["presentation"]!)["placement"].ShouldEqual("primary");
    [Fact] void should_keep_what_it_shows() => ReopenedDocument.ShouldContain("\"mode\":\"icon\"");
    [Fact] void should_keep_the_placement_hint() => ReopenedDocument.ShouldContain("\"placement\":\"primary\"");
    [Fact] void should_say_the_same_after_the_round_trip() => FirstDifference(Document, ReopenedDocument).ShouldBeNull();
}
