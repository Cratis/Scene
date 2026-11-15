// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

public class when_a_designer_changes_a_qualified_icon : Specification
{
    readonly JsonObject _document = JsonNode.Parse(
        """
        { "navigation": { "application": { "outlets": [
          { "name": "topbar", "kind": "navigation",
            "defaults": [{ "kind": "navigation", "id": "orders", "title": "Orders", "icon": "Cratis.Icons.Lucide#truck", "screenplayIcon": "receipt" }] },
          { "name": "topbarButtons", "kind": "actions",
            "defaults": [{ "kind": "button", "id": "add", "title": "Add", "icon": "Other.Icons#tag#filled", "screenplayIcon": "plus" }] }
        ] }, "modules": [] } }
        """)!.AsObject();
    readonly SceneTransportGaps _gaps = new();
    SceneNavigationDeclaration _navigation = null!;

    void Because() => _navigation = SceneNavigation.ToSyntax(_document, _gaps)!;

    [Fact] void should_export_the_edited_lucide_item_not_the_old_bare_name() => ((NavigationItemSyntax)_navigation.Outlets.Single(outlet => outlet.Name == "topbar").Items.Single()).Icon.ShouldEqual("Cratis.Icons.Lucide#truck");
    [Fact] void should_export_the_edited_button_library_and_variant() => ((ToolbarButtonSyntax)_navigation.Outlets.Single(outlet => outlet.Name == "topbarActions").Items.Single()).Icon.ShouldEqual("Other.Icons#tag#filled");
    [Fact] void should_not_preserve_stale_metadata_on_a_carrier() => _gaps.Messages.ShouldBeEmpty();
    [Fact] void should_compare_the_current_icon_without_stale_metadata() => SceneDocumentCanonicalForm.FirstDifference(_document, new JsonObject { ["navigation"] = SceneNavigation.ToJson(_navigation) }).ShouldBeNull();
}
