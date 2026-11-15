// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_a_source_is_missing : a_design_system_turn
{
    protected override DesignSourceSet Gathered() => new([], ["The running app could not be reached"]);

    async Task Because()
    {
        _model.Calls(("finish", new { summary = "There was nothing to read.", gaps = "No sources." }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_tell_the_model_what_is_missing() => _model.Requests[0][^1].Text.ShouldContain("The running app could not be reached");
    [Fact] void should_tell_the_model_there_are_no_sources() => _model.Requests[0][^1].Text.ShouldContain("No sources were found");
    [Fact] void should_return_what_is_missing() => _result.Missing.ShouldContainOnly("The running app could not be reached");
    [Fact] void should_have_no_draft() => _result.Draft.ShouldBeNull();
}
