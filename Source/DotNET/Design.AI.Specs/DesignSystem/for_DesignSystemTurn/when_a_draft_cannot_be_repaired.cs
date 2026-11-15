// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_a_draft_cannot_be_repaired : a_design_system_turn
{
    async Task Because()
    {
        _model
            .Calls(("writeDesignSystem", new { text = Brand.Incomplete }))
            .Calls(("writeDesignSystem", new { text = Brand.Incomplete }))
            .Calls(("writeDesignSystem", new { text = Brand.Incomplete }))
            .Calls(("writeDesignSystem", new { text = Brand.Incomplete }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_not_succeed() => _result.Succeeded.ShouldBeFalse();
    [Fact] void should_have_no_draft() => _result.Draft.ShouldBeNull();
    [Fact] void should_say_why() => _result.Summary.ShouldContain("could not reach a design system the compiler accepts");
    [Fact] void should_stop_asking_the_model() => _model.Requests.Count.ShouldEqual(3);
}
