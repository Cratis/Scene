// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_designing_screen_templates : a_design_turn
{
    const string Template =
        """
        screen template SplitPage
          category Detail
          fits slot content
          left
          right
        """;

    async Task Because()
    {
        var session = DesignSessionReducer.FoldAll(
        [
            new DesignSessionStarted("templates-1", new DesignSubject(DesignSubjectKind.DesignSystem, "shop"), DesignMode.Templates, "ada", []),
        ])!;
        _model
            .Calls(("writeScreen", new { text = Template }))
            .Calls(("listScreens", new { }))
            .Calls(("finish", new { reply = "A split page." }));
        await Run(Request(session, "Add a template with two columns"));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_record_a_revision_of_the_template() => Events<ScreenRevisionRecorded>().Single().Screen.ShouldEqual("SplitPage");
    [Fact] void should_record_the_template_as_screenplay() => Events<ScreenRevisionRecorded>().Single().Text.ShouldContain("screen template SplitPage");
    [Fact] void should_say_it_is_designing_templates() => ToolAnswer("listScreens").ShouldContain("\"mode\":\"templates\"");
    [Fact] void should_list_the_template() => ToolAnswer("listScreens").ShouldContain("SplitPage");
    [Fact] void should_tell_the_model_what_it_designs() => _model.Requests[0][^1].Text.ShouldContain("screen templates");
}
