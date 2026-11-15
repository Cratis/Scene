// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_writing_a_screen : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("listTemplates", new { }), ("describeTemplate", new { name = "ListPage" }))
            .Calls(("writeScreen", new { text = Shop.InvoiceList }))
            .Calls(("finish", new { reply = "I made the invoice list." }));
        await Run(Request(Shop.Session(), "Make a list of invoices"));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_say_what_the_model_said() => _result.Reply.ShouldEqual("I made the invoice list.");
    [Fact] void should_record_one_revision() => Events<ScreenRevisionRecorded>().Count().ShouldEqual(1);
    [Fact] void should_record_the_revision_of_the_screen() => Events<ScreenRevisionRecorded>().Single().Screen.ShouldEqual("InvoiceList");
    [Fact] void should_record_the_text_as_screenplay() => Events<ScreenRevisionRecorded>().Single().Text.ShouldContain("screen InvoiceList");
    [Fact] void should_record_the_turn() => Events<ScreenRevisionRecorded>().Single().TurnId.ShouldEqual("turn-1");
    [Fact] void should_record_who_asked() => Events<ScreenRevisionRecorded>().Single().Author.ShouldEqual("ada");
    [Fact] void should_record_what_was_asked() => Events<ScreenRevisionRecorded>().Single().Prompt.ShouldEqual("Make a list of invoices");
    [Fact] void should_record_the_design_system_version() => Events<ScreenRevisionRecorded>().Single().DesignSystemVersion.ShouldEqual("v1");
    [Fact] void should_touch_the_screen() => _result.Touched.ShouldContainOnly("InvoiceList");
    [Fact] void should_have_no_refusal() => _result.Refusals.ShouldBeEmpty();
    [Fact] void should_answer_the_read_tools_from_the_catalogue() => ToolAnswer("listTemplates").ShouldContain("DetailPage");
    [Fact] void should_describe_the_outlets_of_a_template() => ToolAnswer("describeTemplate").ShouldContain("header");
    [Fact] void should_answer_the_write_with_no_diagnostic_of_error() => ToolAnswer("writeScreen").ShouldNotContain("\"severity\":\"error\"");
    [Fact] void should_report_the_screen_as_it_is_made() => _progress.ShouldContain(progress => progress.Kind == DesignTurnProgressKind.Screen && progress.Text == "InvoiceList");
    [Fact] void should_report_the_reply() => _progress.ShouldContain(progress => progress.Kind == DesignTurnProgressKind.Reply && progress.Text == "I made the invoice list.");
    [Fact] void should_ask_for_a_client_of_the_screen_design_purpose() => _clients.Received(1).For(DesignPurposes.ScreenDesign);
    [Fact] void should_run_as_the_agent_of_the_purpose() => _execution.Received(1).As(DesignPurposes.ScreenDesign, Arg.Is<IDictionary<string, string>?>(properties => properties!["scene.design.turn"] == "turn-1"));
    [Fact] void should_give_the_model_the_tools() => _model.Tools.Select(tool => tool.Name).ShouldContain(Tools.DesignToolbox.Names);
}
