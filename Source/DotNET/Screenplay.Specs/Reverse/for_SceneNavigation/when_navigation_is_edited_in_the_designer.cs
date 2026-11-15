// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

using Cratis.Scene.Screenplay.Reverse.given;
namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// Cratis/StudioIssues#666: the navigation the designer writes into a document is what the export says, and navigation the
// compiler would refuse is reported rather than written into a document that does not compile.
public class when_navigation_is_edited_in_the_designer : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content

        module Shop
          feature Orders
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen List
                title "Orders"
        """;

    string _valid = string.Empty;
    IReadOnlyList<string> _validWarnings = [];
    string _unknownTarget = string.Empty;
    IReadOnlyList<string> _unknownTargetWarnings = [];
    string _unknownSlot = string.Empty;
    IReadOnlyList<string> _unknownSlotWarnings = [];

    // Written in the shape Scene stored before version 5 - regions rather than outlets of navigation - so the export also proves the
    // stored document is upgraded when it is read (StudioIssues#1328).
    static JsonObject Navigation(string item, string modules = "[]") => JsonNode.Parse($$"""
        {"application":{"regions":[{"region":"topbar","items":[{{item}}]},{"region":"sidebar","items":[]}]},"modules":{{modules}}}
        """)!.AsObject();

    void Because()
    {
        RoundTrip(Source);
        (_valid, _validWarnings) = ExportWithNavigation(Navigation("""{"id":"orders","title":"Orders","icon":"lucide:list","target":{"module":"Shop","feature":"Orders"}}""", """[{"module":"Shop","regions":[{"region":"sidebar","mode":"extend","items":[{"id":"x","title":"X","target":{"module":"Shop","feature":"Orders"}}]}]}]"""));
        (_unknownTarget, _unknownTargetWarnings) = ExportWithNavigation(Navigation("""{"id":"gone","title":"Gone","target":{"module":"Nowhere"}}"""));
        (_unknownSlot, _unknownSlotWarnings) = ExportWithNavigation(Navigation("""{"id":"orders","title":"Orders","target":{"module":"Shop"},"slot":"missing"}"""));
    }

    [Fact] void should_export_what_the_designer_wrote() => _valid.ShouldContain("default orders title \"Orders\" icon \"lucide:list\" target Shop.Orders");
    [Fact] void should_export_the_module_outlet_the_designer_wrote() => _valid.ShouldContain("outlet sidebar extends");
    [Fact] void should_export_the_designers_navigation_without_a_warning() => _validWarnings.ShouldBeEmpty();
    [Fact] void should_compile_the_designers_navigation() => DocumentTransport.Import(_valid).Compilation.Success.ShouldBeTrue();

    // The module a target names may be a module of another event model of the application (StudioIssues#894), so it is written, and the package still imports.
    [Fact] void should_write_a_target_the_application_may_declare_in_another_event_model() => _unknownTarget.ShouldContain("target Nowhere");
    [Fact] void should_not_refuse_a_target_that_may_be_another_event_models() => _unknownTargetWarnings.ShouldNotContain(warning => warning.Contains("PLAY0748", StringComparison.Ordinal));
    [Fact] void should_still_import_with_the_target_of_another_event_model() => DocumentTransport.Import(_unknownTarget).Compilation.Success.ShouldBeTrue();
    [Fact] void should_leave_out_a_slot_no_layout_declares() => _unknownSlot.ShouldNotContain("outlet topbar of navigation");
    [Fact] void should_say_why_a_slot_was_left_out() => _unknownSlotWarnings.ShouldContain(warning => warning.Contains("PLAY0749", StringComparison.Ordinal));
}
