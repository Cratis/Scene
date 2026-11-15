// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_a_write_is_refused_and_repaired : a_design_turn
{
    // A screen of the list page with a component the catalogue does not have.
    const string Unknown =
        """
        screen InvoiceList
          template ListPage
            main
              component core.chart chart
        """;

    async Task Because()
    {
        _model
            .Calls(("writeScreen", new { text = Unknown }))
            .Calls(("writeScreen", new { text = Shop.InvoiceList }))
            .Calls(("finish", new { reply = "Done." }));
        await Run(Request(Shop.Session(), "Make a list of invoices"));
    }

    [Fact] void should_tell_the_model_what_is_wrong() => ToolAnswer("writeScreen", 0).ShouldContain("componentNotInCatalogue");
    [Fact] void should_tell_the_model_nothing_changed() => ToolAnswer("writeScreen", 0).ShouldContain("\"applied\":false");
    [Fact] void should_accept_the_repair() => ToolAnswer("writeScreen", 1).ShouldContain("\"applied\":true");
    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_record_only_the_repaired_screen() => Events<ScreenRevisionRecorded>().Single().Text.ShouldNotContain("chart");
}
