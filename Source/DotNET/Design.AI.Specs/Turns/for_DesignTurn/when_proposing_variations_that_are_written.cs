// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_proposing_variations_that_are_written : a_design_turn
{
    const string Wide =
        """
        screen InvoiceList
          template ListPage
            header
              title "Invoices - all of them"
            main
              data Invoice[]
              table Invoice
                column number label "Number"
                column amount label "Amount"
        """;

    async Task Because()
    {
        _model
            .Calls(("proposeVariations", new { screen = "InvoiceList", candidates = new[] { Wide, Shop.InvoiceDetails } }))
            .Calls(("proposeVariations", new { screen = "InvoiceList", candidates = new[] { Wide } }))
            .Calls(("finish", new { reply = "One variation." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Give me a variation"));
    }

    [Fact] void should_refuse_a_candidate_that_is_not_the_screen() => ToolAnswer("proposeVariations", 0).ShouldContain("candidateNeedsTheScreen");
    [Fact] void should_accept_a_candidate_that_is_the_screen() => ToolAnswer("proposeVariations", 1).ShouldContain("\"applied\":true");
    [Fact] void should_propose_the_candidate() => Events<VariationsProposed>().Single().Candidates.Single().Text.ShouldContain("all of them");
}
