// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

public class when_transporting_a_document_without_screens : given.a_rich_scene_document
{
    readonly string _actorId = Guid.NewGuid().ToString();
    string _document = string.Empty;

    void Establish()
    {
        var document = JsonNode.Parse(RichDocument)!;
        document["screens"] = new JsonArray();
        _document = document.ToJsonString();
    }

    void Because() => Transport((_actorId, "Admin", _document));

    [Fact] void should_say_there_is_no_screen_to_transport() =>
        _warnings.ShouldContain(warning => warning.Contains("has no screen to transport", StringComparison.Ordinal));
    [Fact] void should_carry_the_exact_document() => _source.ShouldContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_reopen_the_exact_document() => JsonNode.DeepEquals(JsonNode.Parse(_import.CustomCode.Screens.Single().Document), JsonNode.Parse(_document)).ShouldBeTrue();
    [Fact] void should_reopen_the_exact_role_identity() => _import.CustomCode.Screens.Single().ActorId.ShouldEqual(_actorId);
}
