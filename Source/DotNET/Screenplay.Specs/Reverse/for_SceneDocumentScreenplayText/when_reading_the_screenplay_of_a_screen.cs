// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayText;

// Cratis/StudioIssues#1329: the Screenplay tab of the screen editor shows the screen as the export writes it - the screen with the layout and the outlet
// refinements of its levels - and a document it cannot say is named, not hidden.
public class when_reading_the_screenplay_of_a_screen : Specification
{
    const string Document =
        """
        {
          "layouts": [{ "name": "StudioScreen", "slots": [{ "name": "content" }], "outlets": [{ "name": "toolbar", "kind": "actions", "defaults": [{ "kind": "button", "id": "help", "title": "Help" }] }] }],
          "screenTemplates": [],
          "dialogTemplates": [],
          "screens": [{ "name": "Screen", "layout": "StudioScreen", "slotContent": { "content": [] } }],
          "exposures": [],
          "instanceContributions": [],
          "outletLevels": [{ "kind": "screen", "name": "Screen", "refinements": [{ "outlet": "toolbar", "mode": "extends", "hide": ["help"] }] }]
        }
        """;

    string _code = string.Empty;
    IReadOnlyList<string> _warnings = [];

    void Because() => (_code, _warnings) = SceneDocumentScreenplayText.OfScreen("Seller", string.Empty, Document);

    [Fact] void should_write_the_screen() => _code.ShouldContain("screen Seller");
    [Fact] void should_write_the_outlet_the_screen_refines() => _code.ShouldContain("outlet toolbar extends");
    [Fact] void should_write_what_the_screen_hides() => _code.ShouldContain("hide help");
    [Fact] void should_have_nothing_it_could_not_say() => _warnings.ShouldBeEmpty();
}
