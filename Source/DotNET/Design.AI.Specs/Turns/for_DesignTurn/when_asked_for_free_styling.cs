// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_asked_for_free_styling : a_design_turn
{
    async Task Because()
    {
        // The model tries it, is told it is free styling, and records a refusal with the nearest alternative of the profile instead.
        _model
            .Calls(("applyOperations", new { operations = new object[] { new { op = "set", screen = "InvoiceList", element = "title", prop = "color", value = "#ff0000" } } }))
            .Calls(("applyOperations", new { operations = new object[]
            {
                new
                {
                    op = "refuse",
                    code = "freeStylingNotAllowed",
                    reason = "A colour on one heading is free styling; the look is the design system's.",
                    alternatives = new[] { new { label = "Use a red accent", operations = new object[] { new { op = "profile", key = "accent", value = "#dc2626" } } } },
                },
            } }))
            .Calls(("finish", new { reply = "I can't colour one heading, but I can change the accent of the whole application." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Make the heading red"));
    }

    [Fact] void should_tell_the_model_it_is_free_styling() => ToolAnswer("applyOperations", 0).ShouldContain("freeStylingNotAllowed");
    [Fact] void should_succeed_in_refusing() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_record_the_refusal() => _result.Refusals.Single().Code.ShouldEqual("freeStylingNotAllowed");
    [Fact] void should_say_why() => _result.Refusals.Single().Reason.ShouldContain("free styling");
    [Fact] void should_offer_the_alternative() => _result.Refusals.Single().Alternatives.Single().Label.ShouldEqual("Use a red accent");
    [Fact] void should_offer_it_as_operations() => _result.Refusals.Single().Alternatives.Single().Operations!.Single().ShouldBeOfExactType<ProfileOperation>();
    [Fact] void should_say_so_to_the_person() => _result.Reply.ShouldContain("accent");
}
