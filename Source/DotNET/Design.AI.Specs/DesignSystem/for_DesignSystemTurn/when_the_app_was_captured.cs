// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemTurn;

public class when_the_app_was_captured : a_design_system_turn
{
    protected override DesignSourceSet Gathered() => new([new(DesignSourceKind.RunningApp, "the running app", "Invoices, light", Image: new byte[] { 1, 2, 3 }, MediaType: "image/png")], []);

    async Task Because()
    {
        _model.Calls(("finish", new { summary = "Looked at it." }));
        await Run(new DesignSystemRequest("Shop"));
    }

    [Fact] void should_show_the_model_the_capture() => _model.Requests[0][^1].Contents.OfType<DataContent>().Single().MediaType.ShouldEqual("image/png");
    [Fact] void should_start_with_the_capture() => _model.Requests[0][^1].Text.ShouldContain("Running app");
}
