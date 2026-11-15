// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_a_screen_cannot_be_repaired : a_design_turn
{
    const string Unknown =
        """
        screen InvoiceList
          template ListPage
            main
              component core.chart chart
        """;

    async Task Because()
    {
        // The model keeps writing the same refused screen; the turn is given up after the bound.
        _model
            .Calls(("writeScreen", new { text = Shop.InvoiceList }))
            .Calls(("writeScreen", new { text = Unknown }))
            .Calls(("writeScreen", new { text = Unknown }))
            .Calls(("writeScreen", new { text = Unknown }))
            .Calls(("writeScreen", new { text = Unknown }));
        await Run(Request(Shop.Session(), "Make a list of invoices"));
    }

    [Fact] void should_not_succeed() => _result.Succeeded.ShouldBeFalse();
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_touch_nothing() => _result.Touched.ShouldBeEmpty();
    [Fact] void should_say_why() => _result.Reply.ShouldContain("could not reach a clean design");
    [Fact] void should_say_what_the_catalogue_said() => _result.Reply.ShouldContain("core:chart");
    [Fact] void should_stop_asking_the_model() => _model.Requests.Count.ShouldEqual(4);
}
