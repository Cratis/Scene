// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

using Cratis.Scene.Screenplay.Reverse.given;
namespace Cratis.Scene.Screenplay.Reverse.for_SceneScreenNames;

// A screen written under a name of its own belongs to no role, and keeps the name it was written with (StudioIssues#908). The screen editor opens the
// screen of a document that is called 'Screen', so that is what the imported screen is called in its document - and the document remembers the name it
// was written with, which is what an export writes (StudioIssues#902: the screen editor refused such a screen with 'does not contain a screen to edit').
public class when_importing_a_screen_named_after_no_persona : Specification
{
    const string Source =
        """
        policy IsShopper
          require role "Shopper"

        persona Shopper
          policy IsShopper

        module Shop
          feature Orders
            slice StateView OrderList
              readmodel OrderList
                orderId Uuid
                name String
              screen List
                title "Orders"
        """;

    JsonNode _document = null!;
    IReadOnlyList<string> _gaps = [];
    IReadOnlyList<Cratis.Screenplay.Syntax.ScreenSyntax> _exported = [];

    void Because()
    {
        var imported = DocumentTransport.Import(Source);
        var screen = imported.CustomCode.Screens.Single();
        _document = JsonNode.Parse(screen.Document)!;
        (_exported, _, _) = SceneScreens.ToSyntax(string.Empty, _document.AsObject(), new SceneTransportGaps());
        _gaps = SceneDocumentScreenplayBridge.Export("UI", screen.Document).Diagnostics;
    }

    [Fact] void should_belong_to_no_role() => DocumentTransport.Import(Source).CustomCode.Screens.Single().RoleName.ShouldBeNull();
    [Fact] void should_call_the_screen_the_screen_of_its_document() => _document["screens"]![0]!["name"]!.GetValue<string>().ShouldEqual("Screen");
    [Fact] void should_remember_the_name_it_was_written_with() => _document["native"]!["verbatimNames"]!["Screen"]!.GetValue<string>().ShouldEqual("List");
    [Fact] void should_say_everything_about_it_in_typed_screenplay() => _gaps.ShouldBeEmpty();
    [Fact] void should_export_the_name_it_was_written_with() => _exported.Select(screen => screen.Name).ShouldContainOnly("List");
}
