// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.for_DesignSystemStarter;

public class when_taking_only_the_design_system : given.a_compiled_starter
{
    void Because() => Compile(DesignSystemStarter.CreateDesignSystem());

    [Fact] void should_compile_without_a_diagnostic() => _compilerDiagnostics.ShouldBeEmpty();
    [Fact] void should_declare_no_shell() => _application!.Layouts.ShouldBeEmpty();
    [Fact] void should_declare_no_profile() => _application!.UiProfiles.ShouldBeEmpty();
    [Fact] void should_resolve_without_a_problem() => Problems.ShouldBeEmpty();
    [Fact] void should_report_no_conversion_diagnostic() => _conversion.All.ShouldBeEmpty();
    [Fact] void should_be_the_design_system_of_the_whole_starter() => DesignSystemStarter.Create().ShouldContain(DesignSystemStarter.CreateDesignSystem());
}
