// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_reading_the_design : a_design_turn
{
    async Task Because()
    {
        var session = DesignSessionReducer.FoldAll(
        [
            .. Shop.SessionEvents(("InvoiceList", Shop.InvoiceList)),
            new CommentAdded("c1", "InvoiceList", "The heading is too long", "grace", "title"),
            new CommentAdded("c2", "InvoiceList", "More columns, please", "grace", "table-invoice"),
        ])!;
        _model
            .Calls(("listScreens", new { }), ("readComments", new { element = "title" }), ("readStorylines", new { }), ("readScreen", new { screen = "Nope" }), ("queryDesignSystem", new { what = "words" }))
            .Calls(("queryModel", new { what = "shape", name = "Invoice" }), ("queryModel", new { what = "query", name = "ListInvoices" }), ("queryModel", new { what = "commands" }), ("describeComponent", new { name = "core:nothing" }))
            .Calls(("finish", new { reply = "I looked." }));
        await Run(Request(session, "What do you see?"));
    }

    [Fact] void should_list_the_screens_with_their_templates() => ToolAnswer("listScreens").ShouldContain("\"template\":\"ListPage\"");
    [Fact] void should_read_the_comments_on_an_element() => ToolAnswer("readComments").ShouldContain("too long");
    [Fact] void should_leave_out_the_comments_on_other_elements() => ToolAnswer("readComments").ShouldNotContain("More columns");
    [Fact] void should_read_the_storylines() => ToolAnswer("readStorylines").ShouldContain("Default");
    [Fact] void should_say_there_is_no_such_screen() => ToolAnswer("readScreen").ShouldContain("\"found\":false");
    [Fact] void should_list_what_screens_there_are() => ToolAnswer("readScreen").ShouldContain("InvoiceList");
    [Fact] void should_answer_a_question_about_a_shape() => ToolAnswer("queryModel", 0).ShouldContain("amount");
    [Fact] void should_answer_a_question_about_a_query() => ToolAnswer("queryModel", 1).ShouldContain("ListInvoices");
    [Fact] void should_answer_a_question_about_the_commands() => ToolAnswer("queryModel", 2).ShouldContain("PayInvoice");
    [Fact] void should_say_there_is_no_such_component() => ToolAnswer("describeComponent").ShouldContain("\"found\":false");
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
}
