// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Workbench.for_ScreenplayBridge;

// A host shows a screen as Screenplay text on the server (the design canvas's 'screenplay' seam): it reads the text the way a design turn does.
public class when_a_host_carries_screens_through_the_bridge : Specification
{
    BridgeDocument _compiled = null!;
    string? _text;

    void Because()
    {
        var bridge = new ScreenplayBridge(Shop.Screenplay);
        _compiled = bridge.ToDocument([Shop.InvoiceList], DesignMode.Screens);
        _text = _compiled.Document is { } document ? bridge.ToText(document, "InvoiceList", DesignMode.Screens, new HashSet<string>()) : null;
    }

    [Fact] void should_be_public() => typeof(ScreenplayBridge).IsVisible.ShouldBeTrue();
    [Fact] void should_make_a_result_a_host_can_read() => typeof(BridgeDocument).IsVisible.ShouldBeTrue();
    [Fact] void should_compile_the_text_against_the_application() => _compiled.Succeeded.ShouldBeTrue();
    [Fact] void should_read_the_screen_into_the_document() => _compiled.Document!.Screens.Count.ShouldEqual(1);
    [Fact] void should_print_the_screen_back_as_screenplay() => _text.ShouldContain("screen InvoiceList");
    [Fact] void should_print_the_shape_the_screen_declares() => _text.ShouldContain("shape Invoice");
    [Fact] void should_name_the_screens_a_text_declares() => ScreenplayBridge.Declared(Shop.InvoiceList, DesignMode.Screens).ShouldContainOnly("InvoiceList");
}
