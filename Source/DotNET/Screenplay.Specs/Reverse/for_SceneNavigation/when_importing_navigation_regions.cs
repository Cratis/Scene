// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// Cratis/StudioIssues#666, #1328: the outlets of navigation a Screenplay document declares - the layout's topbar and sidebar with their
// items, targets, slots and logo, and the outlets each module inherits, extends or overrides - arrive in the Scene documents as
// the 'navigation' member the designer edits, and nothing is reported as left behind.
public class when_importing_navigation_regions : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content
          side

          outlet topbar of navigation
            logo image "/acme.svg" title "Acme"
            default sales title "Sales" icon receipt target Shop
            default support title "Support" target Support.Tickets slot side
          outlet sidebar of navigation
            default shop title "Shop" target Shop
              item orders title "Orders" target Shop.Orders
              item returns title "Returns" target Shop.Orders.Returns slot side

        module Shop
          outlet sidebar extends
            item more title "More" target Shop.Customers
          outlet topbar overrides
            item mine title "Mine" target Shop.Orders

          feature Orders
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen List
                title "Orders"
            feature Returns
          feature Customers

        module Support
          outlet sidebar inherits
          feature Tickets
        """;

    JsonObject _navigation = null!;

    static JsonObject Outlet(JsonNode? application, string name) => ((JsonArray)application!["outlets"]!).OfType<JsonObject>().Single(candidate => candidate["name"]!.GetValue<string>() == name);

    JsonObject Refinement(string module, string outlet) =>
        ((JsonArray)Module(module)["refinements"]!).OfType<JsonObject>().Single(candidate => candidate["outlet"]!.GetValue<string>() == outlet);

    JsonObject Module(string name) => ((JsonArray)_navigation["modules"]!).OfType<JsonObject>().Single(candidate => candidate["module"]!.GetValue<string>() == name);

    JsonNode Topbar(int index) => Outlet(_navigation["application"], "topbar")["defaults"]![index]!;

    void Because()
    {
        RoundTrip(Source);
        _navigation = (JsonObject)Documents[0]["navigation"]!;
    }

    [Fact] void should_import() => Imported.Compilation.Success.ShouldBeTrue();
    [Fact] void should_not_warn_that_it_left_navigation_behind() => Imported.Compilation.Diagnostics.ShouldNotContain(diagnostic => diagnostic.Code == ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried);
    [Fact] void should_give_every_document_the_navigation() => Documents.All(document => document["navigation"] is not null).ShouldBeTrue();
    [Fact] void should_have_the_logo() => (_navigation["application"]!["logo"]!["image"]!.GetValue<string>(), _navigation["application"]!["logo"]!["title"]!.GetValue<string>()).ShouldEqual(("/acme.svg", "Acme"));
    [Fact] void should_have_both_outlets_of_navigation() => ((JsonArray)_navigation["application"]!["outlets"]!).Select(outlet => outlet!["name"]!.GetValue<string>()).ShouldContainOnly("topbar", "sidebar");
    [Fact] void should_store_them_as_outlets_of_navigation() => ((JsonArray)_navigation["application"]!["outlets"]!).All(outlet => outlet!["kind"]!.GetValue<string>() == "navigation").ShouldBeTrue();
    [Fact] void should_keep_a_module_target_with_its_icon() => (Topbar(0)["target"]!["module"]!.GetValue<string>(), Topbar(0)["icon"]!.GetValue<string>()).ShouldEqual(("Shop", "Cratis.Icons.Lucide#receipt"));
    [Fact] void should_keep_a_feature_target_and_its_slot() => (Topbar(1)["target"]!["feature"]!.GetValue<string>(), Topbar(1)["slot"]!.GetValue<string>()).ShouldEqual(("Tickets", "side"));
    [Fact] void should_nest_the_sidebar_sub_items() => ((JsonArray)Outlet(_navigation["application"], "sidebar")["defaults"]![0]!["children"]!).Select(item => item!["id"]!.GetValue<string>()).ShouldContainOnly("orders", "returns");
    [Fact] void should_keep_a_nested_feature_path() => Outlet(_navigation["application"], "sidebar")["defaults"]![0]!["children"]![1]!["target"]!["feature"]!.GetValue<string>().ShouldEqual("Orders.Returns");
    [Fact] void should_extend_a_module_outlet() => Refinement("Shop", "sidebar")["mode"]!.GetValue<string>().ShouldEqual("extends");
    [Fact] void should_override_a_module_outlet() => Refinement("Shop", "topbar")["mode"]!.GetValue<string>().ShouldEqual("overrides");
    [Fact] void should_inherit_a_module_outlet() => Refinement("Support", "sidebar")["mode"]!.GetValue<string>().ShouldEqual("inherits");
    [Fact] void should_keep_the_items_of_an_extending_module() => Refinement("Shop", "sidebar")["items"]![0]!["id"]!.GetValue<string>().ShouldEqual("more");
}
