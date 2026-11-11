// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Slots;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_saving_an_upgraded_document_over_one_stored_in_the_outlet_shape : Specification
{
    const string Stored = /*lang=json,strict*/ """{"layouts":[{"name":"Shell","slots":[{"name":"content"}],"outlets":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[],"screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    static readonly EditingScope _scope = new(EditingScopeKind.Screen, "Home");

    SceneDocumentChangeResult _unchanged = null!;
    SceneDocumentChangeResult _layoutChanged = null!;

    void Because()
    {
        var upgraded = SlotShapeUpgrader.Upgrade(Stored).Document.ToJsonString();
        var references = new Dictionary<string, string> { ["Shell"] = Stored };
        _unchanged = SceneDocumentChangeValidation.Validate(_scope, Stored, upgraded, references);
        _layoutChanged = SceneDocumentChangeValidation.Validate(_scope, Stored, upgraded.Replace(/*lang=json,strict*/ """{"name":"content","routed":true}""", """{"name":"content","routed":true},{"name":"side"}"""), references);
    }

    [Fact] void should_compare_it_with_the_upgraded_stored_document() => _unchanged.IsValid.ShouldBeTrue();
    [Fact] void should_still_refuse_a_change_to_what_the_screen_inherits() => _layoutChanged.Violations.Select(violation => violation.CodeName).ShouldContainOnly("nodeNotEditable");
}
