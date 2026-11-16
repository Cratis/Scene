// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_a_draft_is_incomplete : a_design_system_turn
{
    async Task Because()
    {
        _model
            .Calls(("writeDesignSystem", new { text = Brand.Incomplete }))
            .Calls(("writeDesignSystem", new { text = Brand.DesignSystem }))
            .Calls(("finish", new { summary = "Done." }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_tell_the_model_what_the_theme_lacks() => ToolAnswer("writeDesignSystem", 0).ShouldContain("themeIncomplete");
    [Fact] void should_tell_the_model_nothing_changed() => ToolAnswer("writeDesignSystem", 0).ShouldContain("\"applied\":false");
    [Fact] void should_accept_the_repair() => ToolAnswer("writeDesignSystem", 1).ShouldContain("\"applied\":true");
    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_return_only_the_repair() => _result.Draft.ShouldEqual(Brand.DesignSystem);
}
