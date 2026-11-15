// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

public class when_exporting_legacy_bare_icons : Specification
{
    readonly JsonObject _document = JsonNode.Parse(
        """
        { "navigation": { "application": { "outlets": [
          { "name": "topbar", "kind": "navigation", "defaults": [{ "kind": "navigation", "id": "orders", "title": "Orders", "icon": "receipt" }] },
          { "name": "topbarButtons", "kind": "actions", "defaults": [{ "kind": "button", "id": "add", "title": "Add", "icon": "plus" }] }
        ] }, "modules": [] } }
        """)!.AsObject();
    readonly SceneTransportGaps _gaps = new();
    SceneNavigationDeclaration _navigation = null!;

    void Because() => _navigation = SceneNavigation.ToSyntax(_document, _gaps)!;

    [Fact] void should_export_the_bare_item() => ((NavigationItemSyntax)_navigation.Outlets.Single(outlet => outlet.Name == "topbar").Items.Single()).Icon.ShouldEqual("receipt");
    [Fact] void should_export_the_bare_button() => ((ToolbarButtonSyntax)_navigation.Outlets.Single(outlet => outlet.Name == "topbarActions").Items.Single()).Icon.ShouldEqual("plus");
    [Fact] void should_not_report_projection_as_data_loss() => _gaps.Messages.ShouldBeEmpty();
    [Fact] void should_compare_legacy_documents_with_the_projected_round_trip() => SceneDocumentCanonicalForm.FirstDifference(_document, new JsonObject { ["navigation"] = SceneNavigation.ToJson(_navigation) }).ShouldBeNull();
    [Fact] void should_not_rewrite_the_stored_legacy_document() => _document["navigation"]!["application"]!["outlets"]![0]!["defaults"]![0]!["icon"]!.GetValue<string>().ShouldEqual("receipt");
}
