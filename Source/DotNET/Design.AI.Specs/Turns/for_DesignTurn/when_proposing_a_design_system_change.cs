// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_proposing_a_design_system_change : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("proposeDesignSystemChange", new { kind = "variant", summary = "Add a danger variant of Button", component = "Button" }))
            .Calls(("proposeDesignSystemChange", new { kind = "variant", summary = "Add a danger variant of Button", component = "Button", variant = "danger", value = "color.danger" }))
            .Calls(("proposeDesignSystemChange", new { kind = "token", summary = "Add a danger colour", address = "tokens.color.danger" }))
            .Calls(("finish", new { reply = "The design system has no danger button, so I proposed one." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "I want a red delete button"));
    }

    [Fact] void should_refuse_a_variant_proposal_that_names_no_variant() => ToolAnswer("proposeDesignSystemChange", 0).ShouldContain("proposalNeedsVariant");
    [Fact] void should_accept_the_variant() => ToolAnswer("proposeDesignSystemChange", 1).ShouldContain("\"applied\":true");
    [Fact] void should_return_both_proposals() => _result.Proposals.Select(proposal => proposal.Kind).ShouldContainOnly("variant", "token");
    [Fact] void should_carry_what_was_proposed() => _result.Proposals[0].Variant.ShouldEqual("danger");
    [Fact] void should_change_no_screen() => _result.Events.ShouldBeEmpty();
}
