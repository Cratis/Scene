// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip;

public class when_round_tripping_layouts_templates_and_profiles : given.a_round_tripped_screenplay
{
    void Because() => RoundTrip(given.Applications.Design + "\n" + given.Applications.Shell + "\n" + given.Applications.Screens);

    [Fact] void should_bring_back_the_layout_as_it_was() => Printed(layouts: _returned.Layouts).ShouldEqual(Printed(layouts: _original.Layouts));
    [Fact] void should_bring_back_the_ui_profile_as_it_was() => Printed(_returned.Layouts, _returned.UiProfiles, _returned.Themes, _returned.DesignSystems).ShouldEqual(Printed(_original.Layouts, _original.UiProfiles, _original.Themes, _original.DesignSystems));
    [Fact] void should_keep_the_root_template_the_profile_names() => _returned.UiProfiles!.Single().Root!.Name.ShouldEqual("AppShell");
    [Fact] void should_keep_the_theme_the_profile_names() => _returned.UiProfiles!.Single().Theme.ShouldEqual("Daylight");
}
