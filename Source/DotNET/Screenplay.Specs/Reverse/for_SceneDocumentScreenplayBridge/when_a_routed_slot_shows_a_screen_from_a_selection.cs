// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// Cratis/StudioIssues#1332: selecting a row of a table fills a routed slot of the page with another screen, by the route value the slot is addressed by. The editor keeps
// the line natively under the slot, by the Scene name of the screen; Screenplay says it by the name the screen has there, and it arrives under the Scene name again.
public class when_a_routed_slot_shows_a_screen_from_a_selection : given.a_scene_document_transport
{
    const string Document = """
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[{"name":"CatalogPage","fitsSlot":"content","slots":[{"name":"content","primary":true},{"name":"detail","routed":true,"routedBy":["number"],"optional":true}]}],
          "dialogTemplates":[],
          "screens":[
            {"name":"Screen","layout":"StudioScreen","screenTemplate":"CatalogPage",
             "slotContent":{"content":[{"id":"orders-table","name":"AllOrders","componentName":"Cratis.Components:dataTable",
               "properties":{"query":{"queryId":"q-orders","query":"AllOrders","arguments":[],"results":[{"target":"number","field":"number"}]},"dataKey":"number"},"slots":{}}],"detail":[]},
             "native":{"slots":{"detail":[{"at":0,"text":"show Details by number from orderstable.selection"}]}},
             "forms":[],"contributions":[]},
            {"name":"Details","layout":"StudioScreen",
             "slotContent":{"content":[{"id":"details-text","name":"Details text","componentName":"core:text","properties":{"text":"More"},"slots":{}}]},
             "forms":[],"contributions":[]}
          ],
          "exposures":[],
          "instanceContributions":[]
        }
        """;

    void Because() => Transport((Guid.NewGuid().ToString(), "Admin", Document));

    [Fact] void should_compile() { if (!_import.Compilation.Success) throw new InvalidOperationException(string.Join('\n', _import.Compilation.Diagnostics.Select(diagnostic => diagnostic.Code + " " + diagnostic.Message)) + "\n" + _source); }
    [Fact] void should_say_the_screen_by_the_name_it_has_in_screenplay() => _source.ShouldContain("show Admin__Details by number from orderstable.selection");
    [Fact] void should_say_the_line_under_the_slot() => _source.ShouldContain("detail");
    [Fact] void should_bring_it_back_by_the_scene_name_of_the_screen() => Reopened("Admin").Document.ShouldContain("show Details by number from orderstable.selection");
}
