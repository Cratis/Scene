// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Screenplay.Forward;
using Cratis.Scene.Screenplay.Reverse.given;
using SceneModel = Cratis.Scene.Screenplay.Forward;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge.given;

// Prints role documents as Screenplay through the bridge, compiles the printed source into the Scene application the forward
// converter builds, and reopens it through the reverse bridge - the whole round trip a set of documents takes through a .play file.
public class a_scene_document_transport : Specification
{
    protected string _source = string.Empty;
    protected IReadOnlyList<string> _warnings = [];
    protected ReopenedSource _import = null!;
    protected SceneModel.SceneApplication _plan = null!;

    protected void Transport(params (string ActorId, string Role, string Document)[] documents)
    {
        var print = DocumentTransport.Export(documents);
        _source = print.Source;
        _warnings = print.Warnings;
        _import = DocumentTransport.Import(_source);
        _plan = new ScreenplaySceneParser().Parse(_source).Value!;
    }

    protected ImportedScreenDocument Reopened(string role) => _import.CustomCode.Screens.Single(screen => screen.RoleName == role);

    protected static bool SaysTheSame(string expected, string actual) => SceneDocumentCanonicalForm.AreEquivalent(expected, actual);

    protected static string? FirstDifference(string expected, string actual) =>
        SceneDocumentCanonicalForm.FirstDifference(JsonNode.Parse(expected), WithoutSliceResidue(JsonNode.Parse(actual)));

    // The queries of the slice a document was read on ride in it, which the source document never said.
    protected static JsonNode? WithoutSliceResidue(JsonNode? document)
    {
        if (document?["native"] is JsonObject native)
        {
            native.Remove("slice");
            if (native.Count == 0)
            {
                ((JsonObject)document).Remove("native");
            }
        }

        return document;
    }

    protected Screen PlannedScreen(string name) => _plan.Screens.Single(screen => screen.Name == name);

    protected IEnumerable<SceneElement> PlannedElements(string screen) => PlannedScreen(screen).SlotContent.Values.SelectMany(Descendants);

    protected SceneElement PlannedElement(string screen, string id) => PlannedElements(screen).Single(element => element.Id == id);

    static IEnumerable<SceneElement> Descendants(IEnumerable<SceneElement> elements) =>
        elements.SelectMany(element => (IEnumerable<SceneElement>)[element, .. element is ExternalComponent component ? Descendants(component.Slots.Values.SelectMany(slot => slot)) : []]);
}
