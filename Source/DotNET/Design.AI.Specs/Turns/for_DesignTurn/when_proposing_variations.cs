// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_proposing_variations : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("proposeVariations", new { screen = "InvoiceList", templates = new[] { "DetailPage" } }))
            .Calls(("finish", new { reply = "Here is the list on another template." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Show me other layouts for this"));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_propose_the_variations() => Events<VariationsProposed>().Single().Screen.ShouldEqual("InvoiceList");
    [Fact] void should_offer_a_candidate_on_the_template() => Events<VariationsProposed>().Single().Candidates.Single().Text.ShouldContain("template DetailPage");
    [Fact] void should_change_no_screen() => Events<ScreenRevisionRecorded>().ShouldBeEmpty();
    [Fact] void should_give_the_group_an_id_of_the_turn() => Events<VariationsProposed>().Single().GroupId.StartsWith("turn-1/", StringComparison.Ordinal).ShouldBeTrue();
    [Fact] void should_keep_the_prompt() => Events<VariationsProposed>().Single().Prompt.ShouldEqual("Show me other layouts for this");
    [Fact] void should_fold_into_a_group_of_the_session() => DesignSessionReducer.FoldAll([.. Shop.SessionEvents(("InvoiceList", Shop.InvoiceList)), .. _result.Events])!.VariationGroups.Count.ShouldEqual(1);
}
