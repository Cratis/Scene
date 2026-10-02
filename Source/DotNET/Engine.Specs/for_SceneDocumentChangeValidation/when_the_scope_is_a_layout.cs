// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_the_scope_is_a_layout : Specification
{
    const string Stored = """{"layouts":[{"name":"Shell","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[], "screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    const string LayoutChanged = """{"layouts":[{"name":"Shell","slots":[{"name":"content"},{"name":"footer"}]}],"screenTemplates":[],"dialogTemplates":[], "screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    const string ScreenChanged = """{"layouts":[{"name":"Shell","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[], "screens":[{"name":"Home","layout":"Shell","slotContent":{"content":[]},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    static readonly EditingScope _scope = new(EditingScopeKind.Layout, "Shell");

    SceneDocumentChangeResult _changingTheLayout = null!;
    SceneDocumentChangeResult _changingAScreen = null!;

    void Because()
    {
        _changingTheLayout = SceneDocumentChangeValidation.Validate(_scope, Stored, LayoutChanged);
        _changingAScreen = SceneDocumentChangeValidation.Validate(_scope, Stored, ScreenChanged);
    }

    [Fact] void should_accept_a_change_to_the_layout_itself() => _changingTheLayout.IsValid.ShouldBeTrue();
    [Fact] void should_refuse_a_change_to_a_screen() => _changingAScreen.Violations.Select(violation => violation.CodeName).ShouldContainOnly("nodeNotEditable");
    [Fact] void should_name_the_screen_in_the_message() => _changingAScreen.Message.ShouldContain("Home");
}
