// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Shell;

namespace Cratis.Scene.Engine.for_ConstructorCompatibility;

/// <summary>
/// The engine's records keep the constructors an earlier Scene had, so a host compiled against it keeps working (see the model's twin of this specification).
/// </summary>
public class when_a_host_built_against_an_earlier_scene_constructs_a_record : Specification
{
    static readonly (Type Type, Type[] Parameters)[] _constructors =
    [
        (typeof(SampleData.SampleDataCatalogEntry), [typeof(string), typeof(bool), typeof(string), typeof(string), typeof(bool), typeof(string)]),
        (typeof(Profiles.ProfileBlocker), [typeof(Profiles.ProfileBlockerCode), typeof(string), typeof(string), typeof(ShellDiagnosticCode?)])
    ];

    List<string> _missing = null!;

    void Because() => _missing = [.. _constructors.Where(candidate => candidate.Type.GetConstructor(candidate.Parameters) is null).Select(candidate => candidate.Type.Name)];

    [Fact] void should_still_have_every_constructor() => _missing.ShouldBeEmpty();

    [Fact]
    void should_make_an_earlier_blocker_a_blocker_of_the_packages_section()
    {
        var blocker = new Profiles.ProfileBlocker(Profiles.ProfileBlockerCode.MissingDependency, "crm", "Package 'crm' is missing", null);
        (blocker.Severity == Profiles.ProblemSeverity.Blocker && blocker.Section == Profiles.ProfileSection.Packages && blocker.Fix is null).ShouldBeTrue();
    }
}
