// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_asked_for_something_the_catalogue_does_not_have : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("applyOperations", new { operations = new object[] { new { op = "insert", screen = "InvoiceList", outlet = "main", component = "core:carousel" } } }))
            .Calls(("applyOperations", new { operations = new object[] { new { op = "insert", screen = "InvoiceList", outlet = "header", component = "core:button", props = new { label = "New" } } } }))
            .Calls(("finish", new { reply = "There is no carousel, and a button does not go in the header." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Add a carousel"));
    }

    [Fact] void should_refuse_the_component_that_is_not_in_the_catalogue() => ToolAnswer("applyOperations", 0).ShouldContain("componentNotInCatalogue");
    [Fact] void should_refuse_an_outlet_that_does_not_take_the_component() => ToolAnswer("applyOperations", 1).ShouldContain("outletDoesNotAccept");
    [Fact] void should_name_where_the_component_would_fit() => ToolAnswer("applyOperations", 1).ShouldContain("main");
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_still_succeed() => _result.Succeeded.ShouldBeTrue();
}
