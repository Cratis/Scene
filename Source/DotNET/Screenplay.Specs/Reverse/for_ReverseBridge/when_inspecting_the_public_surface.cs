// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Reflection;

namespace Cratis.Scene.Screenplay.Reverse.for_ReverseBridge;

// A host that assembles Scene documents - Studio's board export and import - calls these. Type discovery in a host also lists every public nested type
// by its declaring type, so a public type nested in a type the host cannot see breaks the host's build (CS0122).
public class when_inspecting_the_public_surface : Specification
{
    static readonly Type[] _hostTypes =
    [
        typeof(SceneJson),
        typeof(SceneNative),
        typeof(NativeResidue),
        typeof(SceneNavigation),
        typeof(SceneNavigationDeclaration),
        typeof(SceneModuleNavigation),
        typeof(SceneTemplates),
        typeof(SceneTransportGaps),
        typeof(SceneDocumentCarrier),
        typeof(SceneElementImport),
        typeof(SceneElementFrame),
        typeof(SceneElementScope),
        typeof(SceneOutletLevels),
        typeof(SceneOutletLevels.Levels),
        typeof(SceneFeatureOutlets),
        typeof(SceneDeclarationSet),
        typeof(SceneDocumentScreenplayDeclarations),
        typeof(SceneCommandReferences),
        typeof(SceneDocumentCanonicalForm),
        typeof(SceneDocumentUpgrade)
    ];

    string[] _notPublic = [];
    string[] _hiddenNested = [];

    void Because()
    {
        _notPublic = [.. _hostTypes.Where(type => !type.IsVisible).Select(type => type.FullName!)];
        _hiddenNested = [.. typeof(SceneJson).Assembly.GetTypes()
            .Where(type => type.IsNestedPublic && !type.DeclaringType!.IsVisible)
            .Select(type => type.FullName!)];
    }

    [Fact] void should_make_every_type_a_host_needs_public() => _notPublic.ShouldBeEmpty();
    [Fact] void should_nest_no_public_type_in_a_type_that_is_not_public() => _hiddenNested.ShouldBeEmpty();
    [Fact] void should_expose_the_navigation_members_of_a_declaration_set() => typeof(SceneDeclarationSet).GetProperty("Navigation", BindingFlags.Public | BindingFlags.Instance).ShouldNotBeNull();
    [Fact] void should_expose_the_feature_outlets_of_a_declaration_set() => typeof(SceneDeclarationSet).GetProperty("FeatureOutlets", BindingFlags.Public | BindingFlags.Instance).ShouldNotBeNull();
    [Fact] void should_expose_what_was_kept_natively_of_the_declarations() => typeof(SceneDocumentScreenplayDeclarations).GetProperty("Native", BindingFlags.Public | BindingFlags.Instance).ShouldNotBeNull();
}
