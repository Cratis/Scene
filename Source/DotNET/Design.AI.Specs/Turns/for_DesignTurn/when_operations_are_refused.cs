// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_operations_are_refused : a_design_turn
{
    async Task Because()
    {
        // The second operation names an element that is not there: none of them is applied.
        _model
            .Calls(("applyOperations", new { operations = new object[]
            {
                new { op = "set", screen = "InvoiceList", element = "title", prop = "text", value = "All invoices" },
                new { op = "remove", screen = "InvoiceList", element = "no-such-element" },
            } }))
            .Calls(("applyOperations", new { operations = new object[] { new { op = "set", screen = "InvoiceList", element = "title", prop = "text", value = "Invoices, newest first" } } }))
            .Calls(("finish", new { reply = "Done." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Change the heading"));
    }

    [Fact] void should_tell_the_model_none_was_applied() => ToolAnswer("applyOperations", 0).ShouldContain("\"applied\":false");
    [Fact] void should_say_which_element_is_unknown() => ToolAnswer("applyOperations", 0).ShouldContain("elementUnknown");
    [Fact] void should_let_the_model_repair_it() => ToolAnswer("applyOperations", 1).ShouldContain("\"applied\":true");
    [Fact] void should_not_record_the_refused_change() => Events<ScreenRevisionRecorded>().Single().Text.ShouldNotContain("All invoices");
    [Fact] void should_record_the_repair() => Events<ScreenRevisionRecorded>().Single().Text.ShouldContain("newest first");
}
