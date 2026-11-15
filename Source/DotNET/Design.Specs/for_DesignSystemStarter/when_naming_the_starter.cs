// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.for_DesignSystemStarter;

public class when_naming_the_starter : given.a_compiled_starter
{
    void Because() => Compile(DesignSystemStarter.Create("acme corp-2"));

    [Fact] void should_compile_without_a_diagnostic() => _compilerDiagnostics.ShouldBeEmpty();
    [Fact] void should_name_the_design_system_after_the_product() => _application!.DesignSystems.Single().Name.ShouldEqual("AcmeCorp2Design");
    [Fact] void should_name_the_theme_after_the_product() => _application!.Themes!.Single().Name.ShouldEqual("AcmeCorp2");
    [Fact] void should_say_the_design_system_name_it_declares() => DesignSystemStarter.DesignSystemName("acme corp-2").ShouldEqual("AcmeCorp2Design");
    [Fact] void should_say_the_theme_name_it_declares() => DesignSystemStarter.ThemeName("acme corp-2").ShouldEqual("AcmeCorp2");
    [Fact] void should_resolve_without_a_problem() => Problems.ShouldBeEmpty();
    [Fact] void should_use_the_default_name_when_none_is_left() => DesignSystemStarter.ThemeName("  --  ").ShouldEqual("Product");
    [Fact] void should_not_start_a_name_with_a_digit() => DesignSystemStarter.ThemeName("9 lives").ShouldEqual("Product9Lives");
}
