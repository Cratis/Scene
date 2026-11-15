// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_applying_operations : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("readScreen", new { screen = "InvoiceList" }))
            .Calls(("applyOperations", new { operations = new object[] { new { op = "set", screen = "InvoiceList", element = "title", prop = "text", value = "All invoices" } } }))
            .Calls(("finish", new { reply = "Renamed the heading." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Call the heading All invoices", new DesignFocus("InvoiceList", Element: "title")));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_let_the_model_read_the_ids_of_the_elements() => ToolAnswer("readScreen").ShouldContain("\"id\":\"title\"");
    [Fact] void should_apply_the_operation() => ToolAnswer("applyOperations").ShouldContain("\"applied\":true");
    [Fact] void should_record_one_revision() => Events<ScreenRevisionRecorded>().Count().ShouldEqual(1);
    [Fact] void should_record_the_change() => Events<ScreenRevisionRecorded>().Single().Text.ShouldContain("All invoices");
    [Fact] void should_record_the_operations() => Events<ScreenRevisionRecorded>().Single().Operations.Single().ShouldBeOfExactType<SetOperation>();
    [Fact] void should_record_the_revision_it_is_based_on() => Events<ScreenRevisionRecorded>().Single().BasisRevisionId.ShouldEqual("rev-InvoiceList");
    [Fact] void should_keep_what_it_did_not_change() => Events<ScreenRevisionRecorded>().Single().Text.ShouldContain("table Invoice");
    [Fact] void should_tell_the_model_about_the_selection() => _model.Requests[0][^1].Text.ShouldContain("element title");
    [Fact] void should_fold_into_the_new_current_revision() => DesignSessionReducer.FoldAll([.. Shop.SessionEvents(("InvoiceList", Shop.InvoiceList)), .. _result.Events])!.CurrentRevisionOf("InvoiceList")!.Text.ShouldContain("All invoices");
}
