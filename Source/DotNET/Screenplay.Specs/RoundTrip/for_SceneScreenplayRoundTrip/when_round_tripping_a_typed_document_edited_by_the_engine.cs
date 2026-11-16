// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Editing.Applying;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Screenplay.Reverse;
using Cratis.Scene.Screenplay.Reverse.given;
using SceneJson = Cratis.Scene.Model.SceneJson;

namespace Cratis.Scene.Screenplay.RoundTrip.for_SceneScreenplayRoundTrip;

/// <summary>
/// A document in the form the editor writes - the Studio screen layout and core elements - edited by the engine, printed as Screenplay and read back.
/// </summary>
/// <remarks>
/// Unlike the documents of the shared corpus, this one is made of what typed Screenplay can say, so it travels typed - no preservation carrier - and
/// what comes back is rebuilt from the Screenplay, not handed back verbatim.
/// </remarks>
public class when_round_tripping_a_typed_document_edited_by_the_engine : Specification
{
    const string Document =
        """
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],
          "dialogTemplates":[],
          "screens":[{
            "name":"UI",
            "layout":"StudioScreen",
            "slotContent":{"content":[{
              "id":"screen-root","name":"Screen root",
              "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
              "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch",
              "properties":{},
              "orientation":"Vertical","spacing":8,
              "children":[
                {"id":"title","name":"Title","componentName":"core:title",
                 "properties":{"text":"Orders"},"slots":{},
                 "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
                 "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch"}
              ]
            }]},
            "forms":[],
            "contributions":[]
          }],
          "exposures":[],
          "instanceContributions":[]
        }
        """;

    const string Descriptors =
        """
        [{"component":"core:title","properties":[{"path":"text","label":"Text","group":"Content","valueType":"string"}]}]
        """;

    string _edited = string.Empty;
    string _returned = string.Empty;
    PrintedDocument _printed = null!;
    bool _applied;
    string _refusal = string.Empty;

    void Because()
    {
        var model = JsonSerializer.Deserialize<SceneDocument>(Document, SceneJson.Options)!;
        var context = new EditingContext(DescriptorCatalog.Create(JsonSerializer.Deserialize<List<ComponentDescriptor>>(Descriptors, SceneJson.Options)), new(EditingScopeKind.Screen, "UI"));
        var outcome = EditApplier.Apply(model, new SetPropertyEdit("element:title", "text", JsonSerializer.SerializeToElement("Open orders")), context);
        _applied = outcome.Applied;
        _refusal = string.Join("; ", outcome.Diagnostics.Select(diagnostic => diagnostic.Message));
        _edited = JsonSerializer.SerializeToNode(outcome.Model, SceneJson.Options)!.ToJsonString();
        _printed = new(DocumentTransport.Export([("actor", "UI", _edited)]));
        _returned = DocumentTransport.Import(_printed.Print.Source).CustomCode.Screens.Single(screen => screen.RoleName == "UI").Document;
    }

    [Fact] void should_apply_the_edit() => (_refusal.Length == 0 ? _applied : throw new InvalidOperationException(_refusal)).ShouldBeTrue();
    [Fact] void should_have_changed_the_text() => _edited.ShouldContain("Open orders");
    [Fact] void should_say_it_in_screenplay() => _printed.Print.Source.ShouldContain("Open orders");
    [Fact] void should_travel_typed() => _printed.Print.Source.ShouldNotContain("studio-scene-document:v1:");
    [Fact] void should_report_nothing_it_could_not_say() => _printed.Print.Warnings.ShouldBeEmpty();
    [Fact] void should_bring_back_the_document_the_engine_produced() => SceneDocumentCanonicalForm.AreEquivalent(_edited, _returned).ShouldBeTrue();
    [Fact] void should_bring_back_the_edit() => _returned.ShouldContain("Open orders");

    sealed record PrintedDocument(SceneDocumentApplicationPrint Print);
}
