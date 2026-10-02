// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_a_stored_document_cannot_be_read : Specification
{
    const string Submitted = """{"layouts":[{"name":"Shell","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[], "screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    SceneDocumentChangeResult _result = null!;

    void Because() => _result = SceneDocumentChangeValidation.Validate(
        new EditingScope(EditingScopeKind.Screen, "Home"),
        "{oops",
        Submitted,
        new Dictionary<string, string> { ["Module"] = "also not json" });

    [Fact] void should_treat_it_as_nothing_to_compare_with() => _result.IsValid.ShouldBeTrue();
}
