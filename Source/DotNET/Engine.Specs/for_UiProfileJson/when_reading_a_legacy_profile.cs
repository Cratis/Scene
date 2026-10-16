// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_UiProfileJson;

public class when_reading_a_legacy_profile : Specification
{
    UiProfile _legacy = null!;
    UiProfile _full = null!;

    void Because()
    {
        _legacy = UiProfileJson.Parse("""{"name":"Old","targetPlatform":"web","packages":["core"],"layout":"AppShell"}""");
        _full = UiProfileJson.Parse(
            """{"name":"New","targetPlatform":"web","packages":[],"root":{"template":{"source":"blueprint","id":"AppShell","blueprint":"Cratis.Blueprint.Default","version":"^4.5"},"options":{"showFooter":true}},"appearance":{"colorScheme":"dark","accent":"#4f46e5"},"defaults":{"newScreenTemplate":{"source":"own","id":"Standard"}}}""");
    }

    [Fact] void should_keep_the_legacy_layout() => _legacy.Layout.ShouldEqual("AppShell");
    [Fact] void should_leave_the_root_absent() => _legacy.Root.ShouldBeNull();
    [Fact] void should_leave_the_appearance_absent() => _legacy.Appearance.ShouldBeNull();
    [Fact] void should_leave_the_defaults_absent() => _legacy.Defaults.ShouldBeNull();
    [Fact] void should_read_the_root_template_source() => _full.Root!.Template.Source.ShouldEqual(TemplateReferenceSource.Blueprint);
    [Fact] void should_read_the_root_template_pin() => _full.Root!.Template.Version.ShouldEqual("^4.5");
    [Fact] void should_read_the_root_options() => _full.Root!.Options!["showFooter"]!.GetValue<bool>().ShouldBeTrue();
    [Fact] void should_read_the_colour_scheme() => _full.Appearance!.ColorScheme.ShouldEqual(ColorScheme.Dark);
    [Fact] void should_read_the_accent() => _full.Appearance!.Accent.ShouldEqual("#4f46e5");
    [Fact] void should_read_the_new_screen_template() => _full.Defaults!.NewScreenTemplate!.Id.ShouldEqual("Standard");
}
