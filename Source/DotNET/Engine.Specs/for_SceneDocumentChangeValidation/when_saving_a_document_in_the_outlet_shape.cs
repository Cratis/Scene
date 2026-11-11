// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Slots;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_saving_a_document_in_the_outlet_shape : Specification
{
    const string Stored = /*lang=json,strict*/ """{"layouts":[{"name":"Shell","slots":[{"name":"content"}],"outlets":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[],"screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    static readonly EditingScope _scope = new(EditingScopeKind.Layout, "Shell");

    SceneDocumentChangeResult _legacy = null!;
    SceneDocumentChangeResult _upgraded = null!;
    SceneDocumentChangeResult _twoPrimarySlots = null!;

    void Because()
    {
        _legacy = SceneDocumentChangeValidation.Validate(_scope, Stored, Stored);
        var upgraded = SlotShapeUpgrader.Upgrade(Stored).Document.ToJsonString();
        _upgraded = SceneDocumentChangeValidation.Validate(_scope, Stored, upgraded);
        _twoPrimarySlots = SceneDocumentChangeValidation.Validate(_scope, upgraded, upgraded.Replace(/*lang=json,strict*/ """{"name":"content","routed":true}""", """{"name":"content","routed":true,"primary":true},{"name":"side","primary":true}"""));
    }

    [Fact] void should_refuse_the_outlet_shape() => _legacy.Violations.Select(violation => violation.CodeName).ShouldContainOnly("invalidSlotShape");
    [Fact] void should_say_how_to_migrate() => _legacy.Message.ShouldContain("screenplay migrate --from 5 --to 6");
    [Fact] void should_point_at_the_outlets() => _legacy.Violations[0].Subject.ShouldEqual("$.layouts[0].outlets");
    [Fact] void should_accept_the_upgraded_document() => _upgraded.IsValid.ShouldBeTrue();
    [Fact] void should_refuse_two_primary_slots() => _twoPrimarySlots.Violations.Select(violation => violation.CodeName).ShouldContainOnly("invalidSlotShape");
}
