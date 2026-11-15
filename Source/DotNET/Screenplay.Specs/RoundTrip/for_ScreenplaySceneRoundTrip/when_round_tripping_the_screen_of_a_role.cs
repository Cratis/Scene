// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Screenplay.Forward;

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip;

public class when_round_tripping_the_screen_of_a_role : given.a_round_tripped_screenplay
{
    void Because() => RoundTrip(given.Applications.Design + "\n" + given.Applications.Shell + "\n" + given.Applications.Screens);

    [Fact] void should_bring_back_the_screen_as_it_was() => Printed(Slices(_returned).Single(slice => slice.Name == "Screens").Screens.ToArray()).ShouldEqual(Printed(Slices(_original).Single(slice => slice.Name == "ListOrders").Screens.ToArray()));
    [Fact] void should_hand_the_role_a_document() => _documents.Select(document => document.RoleName).ShouldContain("UI");
    [Fact] void should_say_the_document_in_the_scene_the_forward_converter_builds() => new ScreenplaySceneParser().Parse(_printed.Source).Value!.Screens.Select(screen => screen.Name).ShouldContain("UI");
}
