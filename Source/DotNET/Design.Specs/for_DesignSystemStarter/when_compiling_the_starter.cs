// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.for_DesignSystemStarter;

public class when_compiling_the_starter : given.a_compiled_starter
{
    void Because() => Compile(DesignSystemStarter.Create());

    [Fact] void should_compile_without_a_diagnostic() => _compilerDiagnostics.ShouldBeEmpty();
    [Fact] void should_produce_an_application() => _application.ShouldNotBeNull();
    [Fact] void should_declare_the_design_system() => _application!.DesignSystems.Single().Name.ShouldEqual("ProductDesign");
    [Fact] void should_declare_the_theme_that_implements_it() => _application!.Themes!.Single().Implements.ShouldEqual("ProductDesign");
    [Fact] void should_declare_the_shell() => _application!.Layouts.Select(layout => layout.Name).ShouldContainOnly("AppShell");
    [Fact] void should_declare_the_one_profile() => _application!.UiProfiles.Select(profile => profile.Name).ShouldContainOnly("Desktop");
}
