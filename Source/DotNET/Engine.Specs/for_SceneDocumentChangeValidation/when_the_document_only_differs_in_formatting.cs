// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_the_document_only_differs_in_formatting : Specification
{
    const string Stored = """{"layouts":[{"name":"Shell","slots":[{"name":"content"}],"gap":8}],"screenTemplates":[],"dialogTemplates":[], "screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    /// <summary>
    /// The same layout with its keys in another order and its number written another way.
    /// </summary>
    const string Resubmitted = """{ "instanceContributions": [], "exposures": [], "dialogTemplates": [], "screenTemplates": [], "screens": [ { "forms": [], "contributions": [], "layout": "Shell", "name": "Home", "slotContent": {} } ], "layouts": [ { "gap": 8.0, "slots": [ { "name": "content" } ], "name": "Shell" } ] }""";

    SceneDocumentChangeResult _result = null!;

    void Because() => _result = SceneDocumentChangeValidation.Validate(new EditingScope(EditingScopeKind.Screen, "Home"), Stored, Resubmitted, new Dictionary<string, string> { ["Shell"] = Stored });

    [Fact] void should_not_consider_it_a_change() => _result.IsValid.ShouldBeTrue();
}
