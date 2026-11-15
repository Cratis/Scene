// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// What a button of an outlet of actions shows (Scene 5.1's `display`) is authored in the screen editor. Screenplay has no form for it, so it
// travels with the button among the outlet element's items: Studio -> Screenplay -> Stage plan -> Studio, unchanged. The outlet says no `name` property here:
// one that does is kept on the preservation carrier whatever its buttons show, which is a gap of its own.
public class when_transporting_an_outlet_button_that_shows_only_its_icon : given.a_scene_document_transport
{
    const string Document = """
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],
          "dialogTemplates":[],
          "screens":[{
            "name":"Screen",
            "layout":"StudioScreen",
            "slotContent":{"content":[{
              "id":"screen-root","name":"Screen root",
              "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
              "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch",
              "properties":{},
              "orientation":"Vertical","spacing":8,
              "children":[
                {"id":"toolbar","name":"Toolbar","componentName":"core:outletItems","properties":{"kind":"actions","items":[
                  {"kind":"button","id":"refresh","title":"Refresh","icon":{"library":"Acme.Icons","key":"refresh"},"display":"icon"},
                  {"kind":"button","id":"close","title":"Close"}
                ]},"slots":{}}
              ]
            }]},
            "forms":[],
            "contributions":[]
          }],
          "exposures":[],
          "instanceContributions":[]
        }
        """;

    void Because() => Transport((Guid.NewGuid().ToString(), "Sales", Document));

    string ReopenedDocument => Reopened("Sales").Document;

    [Fact] void should_plan_the_button_with_what_it_shows() => System.Text.Json.JsonSerializer.Serialize(PlannedElement("Sales", "toolbar").Properties["items"]).ShouldContain("\"display\":\"icon\"");
    [Fact] void should_keep_what_it_shows() => ReopenedDocument.ShouldContain("\"display\":\"icon\"");
    [Fact] void should_say_the_same_after_the_round_trip() => FirstDifference(Document, ReopenedDocument).ShouldBeNull();
}
