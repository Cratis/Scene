// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_sending_the_turn_to_the_canvas : a_design_turn
{
    string _result_json = null!;
    string[] _progress_json = null!;

    async Task Because()
    {
        _model
            .Calls(("applyOperations", new { operations = new object[] { new { op = "refuse", code = "freeStylingNotAllowed", reason = "No free styling.", alternatives = Array.Empty<object>() } } }))
            .Calls(("finish", new { reply = "I cannot do that." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Make the heading red"));
        _result_json = JsonSerializer.Serialize(_result.ToWire(), DesignJson.Options);
        _progress_json = [.. _progress.Select(progress => JsonSerializer.Serialize(progress.ToWire(), DesignJson.Options))];
    }

    [Fact] void should_say_the_reply() => _result_json.ShouldContain("\"reply\":\"I cannot do that.\"");
    [Fact] void should_say_the_refusals() => _result_json.ShouldContain("\"code\":\"freeStylingNotAllowed\"");
    [Fact] void should_say_the_proposals_and_what_was_touched() => _result_json.ShouldContain("\"proposals\":[],\"touched\":[]");
    [Fact] void should_not_carry_the_events() => _result_json.ShouldNotContain("Events");
    [Fact] void should_report_a_status_as_a_message() => _progress_json.ShouldContain(json => json.StartsWith("{\"kind\":\"status\",\"message\":", StringComparison.Ordinal));
    [Fact] void should_report_the_reply_as_text() => _progress_json.ShouldContain("{\"kind\":\"reply\",\"text\":\"I cannot do that.\"}");
}
