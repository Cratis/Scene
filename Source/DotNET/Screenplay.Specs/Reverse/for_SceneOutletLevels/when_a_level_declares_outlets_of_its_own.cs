// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneOutletLevels;

// Cratis/StudioIssues#1330: Screenplay says how a feature or a screen refines an outlet, not an outlet a level declares or a level that is neither; such a
// document is not lost - it stays whole on the preservation carrier, and its diagnostics name the member.
public class when_a_level_declares_outlets_of_its_own : Specification
{
    const string Document =
        """
        {
          "layouts": [{ "name": "StudioScreen", "slots": [{ "name": "content" }] }],
          "screenTemplates": [],
          "dialogTemplates": [],
          "screens": [{ "name": "Screen", "layout": "StudioScreen", "slotContent": { "content": [] } }],
          "exposures": [],
          "instanceContributions": [],
          "outletLevels": [{ "kind": "feature", "name": "Orders", "outlets": [{ "name": "toolbar", "kind": "actions", "defaults": [] }] }]
        }
        """;

    SceneDocumentScreenplayExport _export = null!;

    void Because() => _export = SceneDocumentScreenplayBridge.Export("Seller", Document);

    [Fact] void should_keep_the_document_whole_on_the_carrier() => _export.Screen.Directives.Any(SceneDocumentCarrier.IsCarrier).ShouldBeTrue();
    [Fact] void should_name_the_member_that_could_not_travel() => _export.Diagnostics.ShouldContain(diagnostic => diagnostic.Contains("outlet level", StringComparison.Ordinal) && diagnostic.Contains("outlets", StringComparison.Ordinal));
}
