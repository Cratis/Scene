// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;
using Cratis.Scene.Screenplay.Forward;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The arrangement of a layout, screen template or dialog template as Scene holds it and as Screenplay writes it. The conversion is Stage's
/// (ArrangementConverter), the same one that makes the arrangement of a document the renderers draw, so nothing about it lives only in Studio (REN2).
/// </summary>
static class SceneArrangements
{
    static readonly ScreenplayPrinter _printer = new();

    static readonly Lazy<JsonNode?> _studioScreen = new(() => ToJson(
        new ScreenplayCompiler().Parse($"layout {SceneDocumentCanonicalForm.StudioLayoutName}\n  content\n\n  arrangement flow\n    column\n      content grow\n").Value?.Layouts?.SingleOrDefault()?.Arrangement));

    /// <summary>
    /// Writes a Scene arrangement as the Screenplay arrangement it is, or says why it cannot be.
    /// </summary>
    /// <param name="arrangement">The arrangement as the Scene declaration holds it.</param>
    /// <param name="owner">What declares it, for the message when it cannot travel.</param>
    /// <param name="gaps">Receives what the arrangement holds that Screenplay cannot say.</param>
    /// <returns>The Screenplay arrangement, or <see langword="null"/> when there is none or it cannot be written.</returns>
    public static ArrangementSyntax? ToSyntax(JsonNode? arrangement, string owner, SceneTransportGaps gaps)
    {
        if (SceneJson.IsEmpty(arrangement))
        {
            return null;
        }

        try
        {
            var converted = Read(arrangement) is { } scene ? ArrangementConverter.ToSyntax(scene) : null;
            if (converted is null)
            {
                gaps.Member(owner, "arrangement", "it is not a flow or freeform arrangement");
            }

            return converted;
        }
        catch (Exception exception) when (exception is JsonException or InvalidOperationException or FormatException or NotSupportedException or UnknownArrangementNode)
        {
            gaps.Member(owner, "arrangement", $"it cannot be read as a Scene arrangement ({exception.Message})");
            return null;
        }
    }

    /// <summary>
    /// Reads the Screenplay arrangement of a declaration as the Scene arrangement it makes.
    /// </summary>
    /// <param name="syntax">The arrangement as the document declares it.</param>
    /// <returns>The Scene arrangement as JSON, or <see langword="null"/> when there is none.</returns>
    public static JsonNode? ToJson(ArrangementSyntax? syntax) =>
        syntax is not null && ArrangementConverter.Convert(syntax, new ConversionDiagnostics(), "arrangement") is { } scene
            ? JsonSerializer.SerializeToNode(scene, SceneDocumentJson.Options)
            : null;

    /// <summary>
    /// Leaves out the arrangement Studio's own screen layout is given when it is written as Screenplay (its content fills it), because a Scene document does not state it.
    /// </summary>
    /// <param name="layout">The name of the layout.</param>
    /// <param name="arrangement">The arrangement the layout is written with.</param>
    /// <returns>The arrangement, or <see langword="null"/> for Studio's own screen layout with the arrangement it is given.</returns>
    public static ArrangementSyntax? WithoutStudiosOwn(string layout, ArrangementSyntax? arrangement) =>
        layout == SceneDocumentCanonicalForm.StudioLayoutName && JsonNode.DeepEquals(ToJson(arrangement), _studioScreen.Value) ? null : arrangement;

    /// <summary>
    /// Whether a Screenplay arrangement says more than a Scene arrangement can hold (a slot's size in pixels, a hidden place), so that carrying it through Scene
    /// would change what the document says.
    /// </summary>
    /// <param name="arrangement">The arrangement a document declares.</param>
    /// <returns>True when the arrangement does not read back from Scene as it is written.</returns>
    public static bool IsLossy(ArrangementSyntax? arrangement)
    {
        if (arrangement is null)
        {
            return false;
        }

        var back = Read(ToJson(arrangement)) is { } scene ? ArrangementConverter.ToSyntax(scene) : null;
        return back is null || Print(arrangement) != Print(back);
    }

    /// <summary>
    /// Chooses between the arrangement a Scene document holds and the text the document was imported from. The text can say more than Scene can hold (sizes in pixels, hidden
    /// places), so it stands for the arrangement for as long as the document still says what it says; an arrangement edited since is the document's own and wins.
    /// </summary>
    /// <param name="held">The arrangement the Scene document holds.</param>
    /// <param name="text">The arrangement the imported text declared.</param>
    /// <returns>The arrangement to write.</returns>
    public static ArrangementSyntax? Keeps(ArrangementSyntax? held, ArrangementSyntax? text) =>
        held is null || (text is not null && JsonNode.DeepEquals(ToJson(held), ToJson(text))) ? text : held;

    static string Print(ArrangementSyntax arrangement) =>
        _printer.Print(new ApplicationSyntax([], [], [], [], SourceLocation.Start, Layouts: [new LayoutSyntax("Arrangement", [], SourceLocation.Start) { Arrangement = arrangement }]));

    /// <summary>
    /// Scene's JSON does not name the kind of an arrangement or of a flow node - a flow arrangement has a root, a freeform one has variants, a container has a kind and a leaf
    /// a slot name - so the concrete types are read by their shape, as the TypeScript model tells them apart.
    /// </summary>
    static Arrangement? Read(JsonNode? arrangement) => arrangement switch
    {
        JsonObject { } flow when flow["root"] is JsonObject root => new FlowArrangement(ReadNode(root), [.. SceneJson.Array(flow, "overrides").OfType<JsonObject>().Select(ReadOverride)]),
        JsonObject { } freeform when freeform["variants"] is JsonArray variants => new FreeformSlotArrangement([.. variants.OfType<JsonObject>().Select(ReadVariant)]),
        _ => null
    };

    static FlowOverride ReadOverride(JsonObject node) => new(
        node["width"].Deserialize<WidthSizeClass?>(SceneDocumentJson.Options),
        node["height"].Deserialize<HeightSizeClass?>(SceneDocumentJson.Options),
        ReadNode(node["root"] as JsonObject ?? throw new InvalidOperationException("an override has no root")));

    static FlowNode ReadNode(JsonObject node)
    {
        if (SceneJson.String(node, "slotName") is { } slotName)
        {
            return new FlowSlotLeaf(slotName) { Grow = SceneJson.Number(node["grow"]), Span = SceneJson.Integer(node["span"]) };
        }

        var children = SceneJson.Array(node, "children").OfType<JsonObject>().Select(ReadNode).ToList();
        var gap = SceneJson.Number(node["gap"]) ?? 0;
        var kind = node["kind"].Deserialize<FlowContainerKind>(SceneDocumentJson.Options);
        return kind switch
        {
            FlowContainerKind.Row => new FlowRow { Gap = gap, Children = children, Grow = SceneJson.Number(node["grow"]), Span = SceneJson.Integer(node["span"]) },
            FlowContainerKind.Column => new FlowColumn { Gap = gap, Children = children, Grow = SceneJson.Number(node["grow"]), Span = SceneJson.Integer(node["span"]) },
            FlowContainerKind.Grid => new FlowGrid { Gap = gap, Children = children, Grow = SceneJson.Number(node["grow"]), Span = SceneJson.Integer(node["span"]), Columns = SceneJson.Integer(node["columns"]), Rows = SceneJson.Integer(node["rows"]) },
            _ => throw new InvalidOperationException($"flow container kind '{kind}' is not known")
        };
    }

    static FreeformSlotVariant ReadVariant(JsonObject node) => new(
        node["sizeClass"].Deserialize<SizeClass>(SceneDocumentJson.Options) ?? throw new InvalidOperationException("a variant has no size class"),
        [.. SceneJson.Array(node, "placements").OfType<JsonObject>().Select(place => new SlotPlacement(
            SceneJson.String(place, "slotName") ?? throw new InvalidOperationException("a placement has no slot"),
            SceneJson.Number(place["x"]) ?? 0,
            SceneJson.Number(place["y"]) ?? 0,
            SceneJson.Number(place["width"]) ?? 0,
            SceneJson.Number(place["height"]) ?? 0))]);
}
