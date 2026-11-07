// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_saving_a_document_with_an_outlet_item_its_outlet_does_not_take : Specification
{
    const string Stored = """{"layouts":[{"name":"Shell","slots":[{"name":"content"}],"outlets":[{"name":"toolbar","kind":"actions","defaults":[]}]}],"screenTemplates":[],"dialogTemplates":[],"screens":[{"name":"Home","layout":"Shell","slotContent":{},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}""";

    static readonly EditingScope _scope = new(EditingScopeKind.Layout, "Shell");

    SceneDocumentChangeResult _result = null!;

    void Because() => _result = SceneDocumentChangeValidation.Validate(
        _scope,
        Stored,
        Stored.Replace("\"defaults\":[]", "\"defaults\":[{\"kind\":\"tab\",\"id\":\"pricing\",\"title\":\"Pricing\",\"shows\":\"Pricing\"}]"));

    [Fact] void should_refuse_it() => _result.Violations.Select(violation => violation.CodeName).ShouldContainOnly("invalidSlotShape");
    [Fact] void should_name_the_item() => _result.Message.ShouldContain("The tab 'pricing' cannot go in the actions outlet 'toolbar'");
}
