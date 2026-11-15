// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_touching_several_screens : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("writeScreen", new { text = Shop.InvoiceList }))
            .Calls(("writeScreen", new { text = Shop.InvoiceDetails }))
            .Calls(("finish", new { reply = "A list and its details." }));
        await Run(Request(Shop.Session(), "Make invoices with details"));
    }

    [Fact] void should_record_a_revision_of_each() => Events<ScreenRevisionRecorded>().Select(revision => revision.Screen).ShouldContainOnly("InvoiceList", "InvoiceDetails");
    [Fact] void should_share_one_turn() => Events<ScreenRevisionRecorded>().Select(revision => revision.TurnId).Distinct().ShouldContainOnly("turn-1");
    [Fact] void should_give_each_revision_an_id_of_its_own() => Events<ScreenRevisionRecorded>().Select(revision => revision.RevisionId).Distinct().Count().ShouldEqual(2);
    [Fact] void should_fold_into_a_session_with_both_screens() => DesignSessionReducer.FoldAll([.. Shop.SessionEvents(), .. _result.Events])!.Screens.Select(entry => entry.Screen).ShouldContainOnly("InvoiceList", "InvoiceDetails");
}
