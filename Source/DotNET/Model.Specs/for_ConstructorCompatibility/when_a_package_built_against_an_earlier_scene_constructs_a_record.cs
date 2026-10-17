// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.SampleData;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.SizeClasses;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Model.for_ConstructorCompatibility;

/// <summary>
/// A package built against an earlier Scene calls the constructor it was compiled with by its exact signature. Adding a member to a positional record
/// removes that constructor, and the call then fails at run time (<c language="csharp">MissingMethodException</c>), not when the package is built. Every record that gained a member
/// keeps the constructor it had before, and this specification names them.
/// </summary>
public class when_a_package_built_against_an_earlier_scene_constructs_a_record : Specification
{
    static readonly (Type Type, Type[] Parameters)[] _constructors =
    [
        (typeof(UiProfile), [typeof(string), typeof(string), typeof(IReadOnlyList<string>), typeof(TargetSizeClass?), typeof(string), typeof(string), typeof(SampleDataSelection), typeof(RootTemplate), typeof(ProfileAppearance), typeof(ProfileDefaults)]),
        (typeof(ProfileAppearance), [typeof(ColorScheme?), typeof(string)]),
        (typeof(SampleDataPackReference), [typeof(string), typeof(string), typeof(string), typeof(string)]),
        (typeof(TemplateMetadata), [typeof(string), typeof(string), typeof(IReadOnlyList<TemplateScope>), typeof(TemplateCompatibility), typeof(TemplateAttribution), typeof(string), typeof(string), typeof(IReadOnlyList<SliceKind>), typeof(string), typeof(TemplateRole?), typeof(string)])
    ];

    List<string> _missing = null!;

    void Because() => _missing = [.. _constructors.Where(candidate => candidate.Type.GetConstructor(candidate.Parameters) is null).Select(candidate => candidate.Type.Name)];

    [Fact] void should_still_have_every_constructor() => _missing.ShouldBeEmpty();

    [Fact]
    void should_build_the_same_profile_through_the_earlier_constructor()
    {
        var earlier = new UiProfile("Desktop", "web", ["core"], null, null, "Aurora", null, null, new ProfileAppearance(ColorScheme.Dark, "#4f46e5"), null);
        (earlier.Identity is null && earlier.Appearance!.Corners is null && earlier.Appearance.Font is null && earlier.Appearance.Accent == "#4f46e5").ShouldBeTrue();
    }
}
