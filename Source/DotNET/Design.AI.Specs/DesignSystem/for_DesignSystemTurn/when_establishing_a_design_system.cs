// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.AI.Turns;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_establishing_a_design_system : a_design_system_turn
{
    async Task Because()
    {
        _model
            .Calls(("listSources", new { }), ("listConflicts", new { }), ("readDesignSystem", new { }))
            .Calls(("readSource", new { name = "src/styles/app.css" }), ("readSource", new { name = "voice.md" }))
            .Calls(("writeDesignSystem", new { text = Brand.DesignSystem }))
            .Calls(("finish", new { summary = "I set up a design system with an indigo primary.", gaps = "The sources use #4338CA and #4439CB for the primary; I kept #4338CA." }));
        await Run(new DesignSystemRequest("Shop", Brief: "Established brand: indigo"));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_give_the_draft_as_screenplay() => _result.Draft.ShouldEqual(Brand.DesignSystem);
    [Fact] void should_summarise_what_it_did_and_what_a_person_decides() => _result.Summary.ShouldContain("I kept #4338CA");
    [Fact] void should_ask_the_host_for_the_sources_of_the_scope() => _asked!.Scope.ShouldEqual("Shop");
    [Fact] void should_list_the_sources() => ToolAnswer("listSources").ShouldContain("src/styles/app.css");
    [Fact] void should_read_a_source() => ToolAnswer("readSource", 0).ShouldContain("--radius");
    [Fact] void should_not_read_a_source_that_is_not_there() => ToolAnswer("readSource", 1).ShouldContain("voice");
    [Fact] void should_find_the_conflicts_of_the_sources() => ToolAnswer("listConflicts").ShouldContain("#4338ca");
    [Fact] void should_return_the_conflicts() => _result.Conflicts.Select(conflict => conflict.Kind).Distinct().ShouldContainOnly(DesignSystemConflictKind.Color, DesignSystemConflictKind.Corner);
    [Fact] void should_accept_the_write() => ToolAnswer("writeDesignSystem").ShouldContain("\"applied\":true");
    [Fact] void should_have_no_diagnostic_of_error() => _result.Diagnostics.ShouldNotContain(diagnostic => diagnostic.Severity == "error");
    [Fact] void should_ask_for_a_client_of_the_design_system_purpose() => _clients.Received(1).For(DesignPurposes.DesignSystem);
    [Fact] void should_run_as_the_agent_of_the_purpose() => _execution.Received(1).As(DesignPurposes.DesignSystem, Arg.Any<IDictionary<string, string>?>());
    [Fact] void should_tell_the_model_the_steps() => _model.Requests[0][^1].Text.ShouldContain("Voice and naming");
    [Fact] void should_tell_the_model_what_the_brief_says() => _model.Requests[0][^1].Text.ShouldContain("indigo");
    [Fact] void should_report_the_summary() => _progress.ShouldContain(progress => progress.Kind == DesignTurnProgressKind.Reply);
}
