// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_revising_a_design_system : a_design_system_turn
{
    async Task Because()
    {
        _model
            .Calls(("readDesignSystem", new { }))
            .Calls(("writeDesignSystem", new { text = Brand.DesignSystem.Replace("#4338CA", "#1D4ED8", StringComparison.Ordinal) }))
            .Calls(("finish", new { summary = "The primary is blue now." }));
        await Run(new DesignSystemRequest("Shop", Brand.DesignSystem, "Make the primary blue"));
    }

    [Fact] void should_let_the_model_read_what_there_is() => ToolAnswer("readDesignSystem").ShouldContain("design system ShopDesign");
    [Fact] void should_ask_for_a_revision() => _model.Requests[0][^1].Text.ShouldContain("Revise the design system");
    [Fact] void should_give_what_the_person_asked() => _model.Requests[0][^1].Text.ShouldContain("Make the primary blue");
    [Fact] void should_give_the_revised_draft() => _result.Draft.ShouldContain("#1D4ED8");
}
