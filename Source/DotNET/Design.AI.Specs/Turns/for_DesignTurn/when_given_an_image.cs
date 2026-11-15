// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_given_an_image : a_design_turn
{
    static readonly byte[] _png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    async Task Because()
    {
        _model
            .Calls(("writeScreen", new { text = Shop.InvoiceList }))
            .Calls(("finish", new { reply = "I turned the sketch into a list of invoices." }));
        await Run(Request(Shop.Session(), "Make this screen", images: [new DesignImage("image/png", _png, "A sketch of a list")]));
    }

    [Fact] void should_give_the_model_the_image() => _model.Requests[0][^1].Contents.OfType<DataContent>().Single().MediaType.ShouldEqual("image/png");
    [Fact] void should_give_the_model_the_bytes() => _model.Requests[0][^1].Contents.OfType<DataContent>().Single().Data.ToArray().ShouldEqual(_png);
    [Fact] void should_give_the_model_the_title_as_data() => _model.Requests[0][^1].Contents.OfType<TextContent>().Select(text => text.Text).ShouldContain("Image: A sketch of a list");
    [Fact] void should_add_what_to_do_with_an_image_to_the_prompt() => _model.Requests[0][0].Text.ShouldContain("## Images");
    [Fact] void should_make_the_screen() => Events<ScreenRevisionRecorded>().Single().Screen.ShouldEqual("InvoiceList");
}
