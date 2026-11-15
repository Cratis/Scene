// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// Cratis/Scene#215 (decision 0098), StudioIssues#1328: the buttons beside a layout's and a module's topbar - the `topbarActions` outlet of
// actions in Screenplay 6 - arrive in the Scene documents as the `topbarButtons` outlet of actions, the way Scene's navigation model carries
// them, and are written again as buttons of that outlet on export.
public class when_navigation_regions_declare_toolbar_buttons : given.a_navigated_application
{
    const string Source =
        """
        policy Sellers
          require role "seller"

        policy Managers
          require role "manager"

        layout AppShell
          category application
          content

          outlet topbar of navigation
            default shop title "Shop" target Shop
          outlet topbarActions of actions
            default place title "Place order" slice Shop.Orders.PlaceOrder emphasis primary icon plus
              authorize Sellers
            default help title "Help"

        module Shop
          outlet topbarActions extends
            button audit title "Audit" slice Shop.Orders.PlaceOrder emphasis quiet
              authorize Sellers and Managers

          feature Orders
            slice StateChange PlaceOrder
              command PlaceOrder
                orderId Uuid identifier
                produces OrderPlaced
                  orderId = orderId
              event OrderPlaced
                orderId Uuid
              screen PlaceOrder
                title "Place order"
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen List
                title "Orders"
        """;

    JsonObject _navigation = null!;
    ApplicationSyntax _exported = null!;

    static JsonObject Outlet(JsonNode? application, string name) => ((JsonArray)application!["outlets"]!).OfType<JsonObject>().Single(candidate => candidate["name"]!.GetValue<string>() == name);

    JsonObject Button(string id) => ((JsonArray)Outlet(_navigation["application"], "topbarButtons")["defaults"]!).OfType<JsonObject>().Single(candidate => candidate["id"]!.GetValue<string>() == id);

    JsonObject ModuleButton(string id) =>
        ((JsonArray)_navigation["modules"]![0]!["refinements"]![0]!["items"]!).OfType<JsonObject>().Single(candidate => candidate["id"]!.GetValue<string>() == id);

    IEnumerable<ToolbarButtonSyntax> LayoutButtons => _exported.Layouts!.First().Outlets.Single(outlet => outlet.Name == "topbarActions").Items.OfType<ToolbarButtonSyntax>();

    IEnumerable<ToolbarButtonSyntax> ModuleButtons => _exported.Modules.Single(module => module.Name == "Shop").Outlets.Single(outlet => outlet.Name == "topbarActions").Items.OfType<ToolbarButtonSyntax>();

    void Because()
    {
        RoundTrip(Source);
        _navigation = (JsonObject)Documents[0]["navigation"]!;
        _exported = new ScreenplayCompiler().Compile(Exported).Value!;
    }

    [Fact] void should_import() => Imported.Compilation.Success.ShouldBeTrue();
    [Fact] void should_not_warn_that_it_left_navigation_behind() => Imported.Compilation.Diagnostics.ShouldNotContain(diagnostic => diagnostic.Code == ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried);
    [Fact] void should_keep_the_items_beside_the_buttons() => ((JsonArray)Outlet(_navigation["application"], "topbar")["defaults"]!).Single()!["id"]!.GetValue<string>().ShouldEqual("shop");
    [Fact] void should_store_the_buttons_as_an_outlet_of_actions() => Outlet(_navigation["application"], "topbarButtons")["kind"]!.GetValue<string>().ShouldEqual("actions");
    [Fact] void should_carry_every_application_button_in_order() => ((JsonArray)Outlet(_navigation["application"], "topbarButtons")["defaults"]!).Select(button => button!["id"]!.GetValue<string>()).ShouldEqual(["place", "help"]);
    [Fact] void should_carry_the_title_and_the_slice() => (Button("place")["title"]!.GetValue<string>(), Button("place")["slice"]!.GetValue<string>()).ShouldEqual(("Place order", "Shop.Orders.PlaceOrder"));
    [Fact] void should_carry_the_emphasis_and_the_icon() => (Button("place")["emphasis"]!.GetValue<string>(), Button("place")["icon"]!.GetValue<string>()).ShouldEqual(("primary", "Cratis.Icons.Lucide#plus"));
    [Fact] void should_carry_the_policy() => Button("place")["authorize"]!.GetValue<string>().ShouldEqual("Sellers");
    [Fact] void should_leave_out_what_a_button_does_not_say() => ((Button("help")["slice"], Button("help")["emphasis"], Button("help")["authorize"]) is (null, null, null)).ShouldBeTrue();
    [Fact] void should_carry_the_module_button() => (ModuleButton("audit")["emphasis"]!.GetValue<string>(), ModuleButton("audit")["authorize"]!.GetValue<string>()).ShouldEqual(("quiet", "(Sellers and Managers)"));
    [Fact] void should_write_the_application_buttons_again() => LayoutButtons.Select(button => button.Id).ShouldEqual(["place", "help"]);
    [Fact] void should_write_the_slice_emphasis_and_icon_again() => LayoutButtons.First().ShouldMatch(button => button.Slice == "Shop.Orders.PlaceOrder" && button.Emphasis == ToolbarEmphasis.Primary && button.Icon == "plus");
    [Fact] void should_write_the_policy_again() => LayoutButtons.First().Authorize!.References().Select(reference => reference.Name).ShouldEqual(["Sellers"]);
    [Fact] void should_write_the_module_buttons_again() => ModuleButtons.Select(button => button.Id).ShouldEqual(["audit"]);
    [Fact] void should_write_a_combined_policy_again() => ModuleButtons.Single().Authorize!.References().Select(reference => reference.Name).ShouldEqual(["Sellers", "Managers"]);
    [Fact] void should_read_back_to_the_same_navigation() => Reopened.CustomCode.Screens.Select(screen => JsonNode.Parse(screen.Document)!["navigation"]!.ToJsonString()).Distinct().Single().ShouldEqual(_navigation.ToJsonString());
}
