// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayText;

// What the smoke seeding saves: a screen with a table on it and a form for a command.
public class when_reading_the_screenplay_of_a_screen_with_content_and_a_form : Specification
{
    const string Document =
        """
        {
          "layouts": [{ "name": "StudioScreen", "slots": [{ "name": "content" }] }],
          "screenTemplates": [],
          "dialogTemplates": [],
          "screens": [{
            "name": "Screen", "layout": "StudioScreen", "contributions": [],
            "slotContent": { "content": [{ "id": "00000000-1000-0000-0000-0000000000a0", "name": "Screen", "visibility": "Visible", "isEnabled": true, "opacity": 1, "size": {}, "zIndex": 0, "minimumSize": {}, "maximumSize": {}, "margin": { "left": 0, "top": 0, "right": 0, "bottom": 0 }, "horizontalAlignment": "Stretch", "verticalAlignment": "Stretch", "properties": {}, "children": [], "orientation": "Vertical", "spacing": 8 }] },
            "forms": [{ "name": "Place Order", "forCommand": "Place Order", "fields": [{ "name": "customer", "sourceProperty": "customer" }] }]
          }],
          "exposures": [],
          "instanceContributions": []
        }
        """;

    string _code = string.Empty;

    void Because() => (_code, _) = SceneDocumentScreenplayText.OfScreen("Shopper", string.Empty, Document);

    [Fact] void should_write_the_screen() => _code.ShouldContain("screen Shopper");
}
