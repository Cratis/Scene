// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_a_draft_breaks_a_contrast_rule : a_design_system_turn
{
    async Task Because()
    {
        _model
            .Calls(("writeDesignSystem", new { text = Brand.LowContrast }))
            .Calls(("finish", new { summary = "Done." }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_still_take_the_draft() => _result.Draft.ShouldEqual(Brand.LowContrast);
    [Fact] void should_warn_a_person_of_the_contrast() => _result.Diagnostics.ShouldContain(diagnostic => diagnostic.Code == "contrastBelowRule" && diagnostic.Severity == "warning");
    [Fact] void should_tell_the_model() => ToolAnswer("writeDesignSystem").ShouldContain("contrastBelowRule");
}
