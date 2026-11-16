// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentCanonicalForm;

public class when_asking_for_the_default_layout : Specification
{
    JsonObject _first = null!;
    JsonObject _second = null!;

    void Because()
    {
        _first = SceneDocumentCanonicalForm.DefaultLayoutDeclaration();
        _second = SceneDocumentCanonicalForm.DefaultLayoutDeclaration();
    }

    [Fact] void should_be_the_layout_every_screen_is_drawn_in() => _first["name"]!.GetValue<string>().ShouldEqual(SceneDocumentCanonicalForm.StudioLayoutName);
    [Fact] void should_have_one_content_slot() => _first["slots"]!.AsArray().Select(slot => slot!["name"]!.GetValue<string>()).ShouldContainOnly("content");
    [Fact] void should_give_each_caller_its_own_declaration() => ReferenceEquals(_first, _second).ShouldBeFalse();
    [Fact] void should_read_back_as_the_canonical_form_of_a_document_that_declares_it() =>
        SceneDocumentCanonicalForm.FirstDifference(new JsonObject { ["layouts"] = new JsonArray(_first) }, new JsonObject()).ShouldBeNull();
}
