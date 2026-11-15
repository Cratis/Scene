// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_FreeScreenConverter;

public class when_translating_free_screens_declared_in_a_module_and_a_feature : given.a_translated_free_screen
{
    void Because() => Translate(
        """
        module Invoicing
          screen ModuleScreen
            title "Module"
          feature Paying
            screen FeatureScreen
              title "Feature"
        """);

    [Fact] void should_translate_both() => _result.Screens.Select(screen => screen.Name).ShouldContainOnly("ModuleScreen", "FeatureScreen");
    [Fact] void should_record_where_the_module_screen_is_declared() => _result.Screens.Single(screen => screen.Name == "ModuleScreen").Path.ShouldContainOnly("Invoicing");
    [Fact] void should_record_where_the_feature_screen_is_declared() => _result.Screens.Single(screen => screen.Name == "FeatureScreen").Path.ShouldContainOnly("Invoicing", "Paying");
}
