// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

public class when_transporting_a_document_with_an_unknown_member : given.a_rich_scene_document
{
    readonly string _actorId = Guid.NewGuid().ToString();
    string _document = string.Empty;

    void Establish()
    {
        var document = JsonNode.Parse(RichDocument)!;
        document["screens"]![0]!["slotContent"]!["content"]![0]!["children"]![0]!["package"] = new JsonObject { ["name"] = "core" };
        _document = document.ToJsonString();
    }

    void Because() => Transport((_actorId, "Admin", _document));

    [Fact] void should_name_the_unknown_member() =>
        _warnings.ShouldContain(warning => warning.Contains("element 'orders-title' member 'package'", StringComparison.Ordinal));
    [Fact] void should_carry_the_exact_document() => _source.ShouldContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_still_write_what_typed_screenplay_can_say() => _source.ShouldContain("id \"orders-title\"");
    [Fact] void should_reopen_the_exact_document() => JsonNode.DeepEquals(JsonNode.Parse(_import.CustomCode.Screens.Single().Document), JsonNode.Parse(_document)).ShouldBeTrue();
    [Fact] void should_reopen_the_exact_role_identity() => _import.CustomCode.Screens.Single().ActorId.ShouldEqual(_actorId);
}
