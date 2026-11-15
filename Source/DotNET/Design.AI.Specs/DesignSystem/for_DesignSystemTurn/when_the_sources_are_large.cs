// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_the_sources_are_large : a_design_system_turn
{
    protected override DesignSourceSet Gathered() => new([Brand.File("huge.css", new string('x', DesignSystemTurn.MaximumSourceLength + 500))], []);

    async Task Because()
    {
        _model.Calls(("readSource", new { name = "huge.css" })).Calls(("finish", new { summary = "Done." }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_say_it_was_cut() => ToolAnswer("readSource").ShouldContain("\"truncated\":true");
}
