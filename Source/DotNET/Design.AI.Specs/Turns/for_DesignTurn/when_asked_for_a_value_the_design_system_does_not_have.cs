// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_asked_for_a_value_the_design_system_does_not_have : a_design_turn
{
    async Task Because()
    {
        // The accent of the profile takes what the design system has; a colour of its own is refused with a proposal to the design system as the way forward.
        _model
            .Calls(("applyOperations", new { operations = new object[] { new { op = "profile", key = "accent", value = "#dc2626" } } }))
            .Calls(("finish", new { reply = "The design system has no such red; I can propose one." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Make the accent #dc2626"));
    }

    [Fact] void should_tell_the_model_it_is_a_value_of_its_own() => ToolAnswer("applyOperations").ShouldContain("offSystemValue");
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_not_give_a_profile_to_the_host() => _result.Profile.ShouldBeNull();
    [Fact] void should_return_what_the_catalogue_refused() => _result.Refusals.Single().Code.ShouldEqual("offSystemValue");
    [Fact] void should_offer_a_proposal_to_the_design_system() => _result.Refusals.Single().Alternatives.Single().Proposal!.Kind.ShouldEqual("token");
}
