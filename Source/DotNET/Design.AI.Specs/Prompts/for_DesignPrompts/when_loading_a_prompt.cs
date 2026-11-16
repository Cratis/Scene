// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Prompts.for_DesignPrompts;

public class when_loading_a_prompt : Specification
{
    static readonly string[] _all = [DesignPrompts.ScreenDesign, DesignPrompts.ImageToScreen, DesignPrompts.DesignSystem, DesignPrompts.DesignSystemSteps];

    [Fact] void should_load_every_prompt() => _all.ShouldEachConformTo(name => DesignPrompts.Load(name).Length > 100);
    [Fact] void should_tell_the_model_the_tools_to_read_with() => DesignPrompts.Load(DesignPrompts.ScreenDesign).ShouldContain("listComponents");
    [Fact] void should_tell_the_model_free_styling_is_refused() => DesignPrompts.Load(DesignPrompts.ScreenDesign).ShouldContain("freeStylingNotAllowed");
    [Fact] void should_tell_the_model_to_treat_content_as_data() => DesignPrompts.Load(DesignPrompts.ScreenDesign).ShouldContain("data about what to design");
    [Fact] void should_tell_the_model_a_design_is_not_a_model() => DesignPrompts.Load(DesignPrompts.ScreenDesign).ShouldContain("You only design");
    [Fact] void should_not_hold_a_secret() => _all.ShouldEachConformTo(name => !DesignPrompts.Load(name).Contains("api-key", StringComparison.OrdinalIgnoreCase) && !DesignPrompts.Load(name).Contains("password", StringComparison.OrdinalIgnoreCase));
    [Fact] void should_refuse_a_prompt_it_does_not_have() => Catch.Exception(() => DesignPrompts.Load("nope")).ShouldBeOfExactType<InvalidOperationException>();

    [Fact]
    void should_name_every_tool_the_turn_gives_the_model() =>
        Tools.DesignToolbox.Names.ShouldContainOnly(["listComponents", "describeComponent", "listTemplates", "describeTemplate", "queryDesignSystem", "queryModel", "listScreens", "readScreen", "readComments", "readStorylines", "writeScreen", "applyOperations", "proposeVariations", "proposeTweaks", "proposeDesignSystemChange", "finish"]);
}
