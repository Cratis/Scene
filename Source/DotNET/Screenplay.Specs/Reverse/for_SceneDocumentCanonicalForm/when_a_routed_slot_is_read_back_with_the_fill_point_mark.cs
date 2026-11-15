// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentCanonicalForm;

// A Scene 4 layout outlet the upgrader turned into a routed slot carries no fill point mark; read back from Screenplay it has one.
public class when_a_routed_slot_is_read_back_with_the_fill_point_mark : Specification
{
    string? _sameMark;
    string? _otherMark;

    void Because()
    {
        var stored = JsonNode.Parse("""{"layouts":[{"name":"Shell","slots":[{"name":"content"},{"name":"banner","routed":true}]}]}""");
        _sameMark = SceneDocumentCanonicalForm.FirstDifference(stored, JsonNode.Parse("""{"layouts":[{"name":"Shell","slots":[{"name":"content"},{"name":"banner","screenplaySlot":true,"routed":true}]}]}"""));
        _otherMark = SceneDocumentCanonicalForm.FirstDifference(stored, JsonNode.Parse("""{"layouts":[{"name":"Shell","slots":[{"name":"content"},{"name":"banner","screenplaySlot":false,"routed":true}]}]}"""));
    }

    [Fact] void should_say_the_same_as_the_stored_slot() => _sameMark.ShouldBeNull();
    [Fact] void should_tell_a_region_from_a_fill_point() => _otherMark.ShouldNotBeNull();
}
