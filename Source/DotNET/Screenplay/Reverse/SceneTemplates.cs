// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The layouts, screen templates and dialog templates a Scene document declares, as typed Screenplay declarations - their
/// slots, metadata, outlets, display text and the content they put in their own slots - and back.
/// </summary>
public static class SceneTemplates
{
    const string Layout = "layout";
    const string ScreenTemplate = "screen template";
    const string DialogTemplate = "dialog template";

    /// <summary>
    /// Studio's mark on a slot that is a Screenplay `slot &lt;name&gt;` fill point; Scene reads past members it does not know.
    /// </summary>
    const string RecursiveMember = "screenplaySlot";

    static readonly string[] _layoutMembers = ["name", "slots", "metadata", "outlets", "arrangement", "behaviors"];
    static readonly string[] _templateMembers = [.. _layoutMembers, "content", "displayName", "description", SceneNative.Member];
    static readonly string[] _screenTemplateMembers = [.. _templateMembers, "fitsSlot"];
    static readonly string[] _unsupported = ["behaviors"];
    static readonly string[] _metadataMembers = ["type", "category", "scopes", "sliceKinds"];
    static readonly string[] _slotMembers = ["name", "arrangement", "role", "routed", "routedBy", "primary", "optional"];
    static readonly string[] _slotRoles = ["page", "pane", "panel"];
    static readonly HashSet<string> _recursiveSlotMembers = [with(StringComparer.Ordinal), "name", "routed", RecursiveMember];
    static readonly string[] _outletMembers = ["name", "kind", "subject", "slot", "defaults"];
    static readonly string[] _outletKinds = ["actions", "filters", "tabs", "stats", "navigation"];
    static readonly string[] _outletSubjects = ["item", "screen"];

    public static IEnumerable<LayoutSyntax> Layouts(JsonObject root, SceneTransportGaps gaps) =>
        SceneJson.Array(root, "layouts").OfType<JsonObject>().Select(layout => ToLayout(layout, gaps)).OfType<LayoutSyntax>();

    /// <summary>
    /// The screen templates a document declares, as Screenplay syntax. What cannot travel is added to the gaps.
    /// </summary>
    public static IEnumerable<ScreenTemplateSyntax> ScreenTemplates(JsonObject root, SceneTransportGaps gaps, bool includeNative = true) =>
        SceneJson.Array(root, "screenTemplates").OfType<JsonObject>().Select(template => ToScreenTemplate(template, gaps, includeNative)).OfType<ScreenTemplateSyntax>();

    public static IEnumerable<DialogTemplateSyntax> DialogTemplates(JsonObject root, SceneTransportGaps gaps, bool includeNative = true) =>
        SceneJson.Array(root, "dialogTemplates").OfType<JsonObject>().Select(template => ToDialogTemplate(template, gaps, includeNative)).OfType<DialogTemplateSyntax>();

    /// <summary>
    /// A layout keeps every outlet it declares, so a screen that contributes to one compiles against the layout alone. The items and the logo
    /// of the application's navigation - the outlets of navigation and the buttons beside them - are the document's 'navigation' member
    /// (SceneNavigation), which the designer edits and which fills these outlets again on export.
    /// </summary>
    public static JsonObject ToJson(LayoutSyntax layout)
    {
        var navigationNames = SceneNavigation.NavigationNames(layout.Outlets);
        var outlets = layout.Outlets.Select(outlet => SceneNavigation.IsNavigationOutlet(outlet, navigationNames) ? outlet with { Items = [], Logo = null } : outlet);
        return Declaration(layout.Name, WithRecursive(layout.Slots, layout.RecursiveSlots), layout.TemplateType, layout.Category, layout.RestrictsScopes, layout.Scopes, outlets, SceneArrangements.WithoutStudiosOwn(layout.Name, layout.Arrangement), layout.SliceKinds);
    }

    /// <summary>
    /// The screen template as a Scene document declares it.
    /// </summary>
    public static JsonObject ToJson(ScreenTemplateSyntax template)
    {
        var json = Declaration(template.Name, WithRecursive(template.Slots, template.RecursiveSlots), template.TemplateType, template.Category, template.RestrictsScopes, template.Scopes, template.Outlets, template.Arrangement, template.SliceKinds);
        SceneValues.Optional(json, "fitsSlot", template.FitsSlot);
        Describe(json, template.DisplayName, template.Description, template.Content);
        return json;
    }

    /// <summary>
    /// The dialog template as a Scene document declares it.
    /// </summary>
    public static JsonObject ToJson(DialogTemplateSyntax template)
    {
        var json = Declaration(template.Name, WithRecursive(template.Slots, template.RecursiveSlots), template.TemplateType, template.Category, template.RestrictsScopes, template.Scopes, template.Outlets, template.Arrangement, template.SliceKinds);
        Describe(json, template.DisplayName, template.Description, template.Content);
        return json;
    }

    /// <summary>
    /// A declaration with the mark on every routed slot that says nothing else, set to what reading it infers when it has none - so a stored slot
    /// without the mark and the same slot read back with it say the same. A Scene 4 outlet the upgrader turned into a routed slot carries no mark.
    /// </summary>
    internal static JsonObject WithRecursiveMarks(JsonObject declaration)
    {
        if (SceneJson.Array(declaration, "slots") is not { Count: > 0 } slots ||
            !slots.OfType<JsonObject>().Any(slot => !slot.ContainsKey(RecursiveMember) && Flag(slot, "routed") && slot.All(member => _recursiveSlotMembers.Contains(member.Key))))
        {
            return declaration;
        }

        var copy = (JsonObject)declaration.DeepClone();
        foreach (var slot in SceneJson.Array(copy, "slots").OfType<JsonObject>())
        {
            if (!slot.ContainsKey(RecursiveMember) && Flag(slot, "routed") && slot.All(member => _recursiveSlotMembers.Contains(member.Key)))
            {
                slot[RecursiveMember] = IsOnlyRecursive(copy, slot);
            }
        }

        return copy;
    }

    /// <summary>
    /// A `slot &lt;name&gt;` a template declares - a recursive fill point - is a routed slot to Scene, the way Stage writes it. Studio marks it
    /// (RecursiveMember), also on a slot the template both lays out and declares as a fill point, so it reads back as the same declaration.
    /// </summary>
    static IEnumerable<(SlotSyntax Slot, bool Recursive)> WithRecursive(IEnumerable<SlotSyntax> slots, IEnumerable<TemplateSlotSyntax> recursive)
    {
        var declared = slots.ToArray();
        var fillPoints = recursive.Select(slot => slot.Name).ToHashSet(StringComparer.Ordinal);
        var names = declared.Select(slot => slot.Name).ToHashSet(StringComparer.Ordinal);
        return
        [
            .. declared.Select(slot => (slot, fillPoints.Contains(slot.Name))),
            .. recursive.Where(slot => names.Add(slot.Name)).Select(slot => (new SlotSyntax(slot.Name, SourceLocation.Start) { Routed = true }, true))
        ];
    }

    static LayoutSyntax? ToLayout(JsonObject layout, SceneTransportGaps gaps)
    {
        if (Named(layout, Layout, _layoutMembers, gaps) is not { } name)
        {
            return null;
        }

        var (type, category, restricts, scopes, sliceKinds) = Metadata(layout, $"{Layout} '{name}'", gaps);
        return new LayoutSyntax(name, Slots(layout, gaps), SourceLocation.Start)
        {
            RecursiveSlots = RecursiveSlots(layout),
            TemplateType = type,
            Category = category,
            RestrictsScopes = restricts,
            Scopes = scopes,
            SliceKinds = sliceKinds,
            Outlets = Outlets(layout, $"{Layout} '{name}'", gaps),
            Arrangement = SceneArrangements.ToSyntax(layout["arrangement"], $"{Layout} '{name}'", gaps)
        };
    }

    static ScreenTemplateSyntax? ToScreenTemplate(JsonObject template, SceneTransportGaps gaps, bool includeNative)
    {
        if (Named(template, ScreenTemplate, _screenTemplateMembers, gaps) is not { } name)
        {
            return null;
        }

        var owner = $"{ScreenTemplate} '{name}'";
        var (type, category, restricts, scopes, sliceKinds) = Metadata(template, owner, gaps);
        return new ScreenTemplateSyntax(name, Slots(template, gaps), SourceLocation.Start, SceneJson.String(template, "fitsSlot"))
        {
            RecursiveSlots = RecursiveSlots(template),
            TemplateType = type,
            Category = category,
            RestrictsScopes = restricts,
            Scopes = scopes,
            SliceKinds = sliceKinds,
            Outlets = Outlets(template, owner, gaps),
            Arrangement = SceneArrangements.ToSyntax(template["arrangement"], owner, gaps),
            DisplayName = SceneJson.String(template, "displayName"),
            Description = SceneJson.String(template, "description"),
            Content = Content(template, gaps, includeNative)
        };
    }

    static DialogTemplateSyntax? ToDialogTemplate(JsonObject template, SceneTransportGaps gaps, bool includeNative)
    {
        if (Named(template, DialogTemplate, _templateMembers, gaps) is not { } name)
        {
            return null;
        }

        var owner = $"{DialogTemplate} '{name}'";
        var (type, category, restricts, scopes, sliceKinds) = Metadata(template, owner, gaps);
        return new DialogTemplateSyntax(name, Slots(template, gaps), SourceLocation.Start)
        {
            RecursiveSlots = RecursiveSlots(template),
            TemplateType = type,
            Category = category,
            RestrictsScopes = restricts,
            Scopes = scopes,
            SliceKinds = sliceKinds,
            Outlets = Outlets(template, owner, gaps),
            Arrangement = SceneArrangements.ToSyntax(template["arrangement"], owner, gaps),
            DisplayName = SceneJson.String(template, "displayName"),
            Description = SceneJson.String(template, "description"),
            Content = Content(template, gaps, includeNative)
        };
    }

    static string? Named(JsonObject declaration, string scope, string[] members, SceneTransportGaps gaps)
    {
        if (SceneJson.String(declaration, "name") is not { Length: > 0 } name || !SceneJson.IsIdentifier(name))
        {
            gaps.Add($"Scene {scope} '{SceneJson.String(declaration, "name")}' cannot travel as typed Screenplay: its name is not a Screenplay name.");
            return null;
        }

        gaps.UnknownMembers(declaration, $"{scope} '{name}'", members);
        foreach (var member in _unsupported.Where(member => !SceneJson.IsEmpty(declaration[member])))
        {
            gaps.Member($"{scope} '{name}'", member, "Studio does not carry a declaration's " + member + " into Screenplay yet");
        }

        return name;
    }

    static (string? Type, string? Category, bool Restricts, IReadOnlyList<string> Scopes, IReadOnlyList<string> SliceKinds) Metadata(JsonObject declaration, string owner, SceneTransportGaps gaps)
    {
        if (SceneJson.Object(declaration, "metadata") is not { } metadata)
        {
            return (null, null, false, [], []);
        }

        gaps.UnknownMembers(metadata, owner + " metadata", _metadataMembers);
        var scopes = metadata["scopes"] is JsonArray array
            ? array.Select(scope => scope is JsonValue value && value.TryGetValue<string>(out var text) ? text : null).ToArray()
            : [];
        if (scopes.Any(scope => scope is null || !SceneJson.IsIdentifier(scope)))
        {
            gaps.Member(owner, "metadata.scopes", "every scope must be a name");
        }

        var sliceKinds = metadata["sliceKinds"] is JsonArray kinds
            ? kinds.Select(kind => kind is JsonValue value && value.TryGetValue<string>(out var text) ? text : null).OfType<string>().ToArray()
            : [];
        return (SceneJson.String(metadata, "type"), SceneJson.String(metadata, "category"), metadata["scopes"] is JsonArray, [.. scopes.OfType<string>().Select(scope => scope.ToLowerInvariant())], sliceKinds);
    }

    static IReadOnlyList<SlotSyntax> Slots(JsonObject declaration, SceneTransportGaps gaps) =>
        [.. SceneJson.Array(declaration, "slots").OfType<JsonObject>().Where(slot => !IsOnlyRecursive(declaration, slot)).Select(slot => Slot(Without(slot, RecursiveMember), gaps)).OfType<SlotSyntax>()];

    static IReadOnlyList<TemplateSlotSyntax> RecursiveSlots(JsonObject declaration) =>
        [.. SceneJson.Array(declaration, "slots").OfType<JsonObject>().Where(slot => Flag(slot, RecursiveMember) || IsOnlyRecursive(declaration, slot))
            .Select(slot => SceneJson.String(slot, "name")).OfType<string>().Select(name => new TemplateSlotSyntax(name, SourceLocation.Start))];

    /// <summary>
    /// A slot that is only a fill point: one Studio marked so and that says nothing but its name and that it is routed, or - stored before
    /// the mark, the way Stage writes it and Scene upgrades a template outlet - a routed slot that says nothing else and that no arrangement places.
    /// </summary>
    static bool IsOnlyRecursive(JsonObject declaration, JsonObject slot) =>
        SceneJson.String(slot, "name") is { } name &&
        Flag(slot, "routed") &&
        slot.All(member => _recursiveSlotMembers.Contains(member.Key)) &&
        (Flag(slot, RecursiveMember) || (!slot.ContainsKey(RecursiveMember) && SceneJson.Member(declaration, "arrangement")?.ToJsonString().Contains($"\"{name}\"", StringComparison.Ordinal) != true));

    static JsonObject Without(JsonObject slot, string member)
    {
        if (!slot.ContainsKey(member))
        {
            return slot;
        }

        var copy = (JsonObject)slot.DeepClone();
        copy.Remove(member);
        return copy;
    }

    static SlotSyntax? Slot(JsonObject slot, SceneTransportGaps gaps)
    {
        if (SceneJson.String(slot, "name") is not { Length: > 0 } name || !SceneJson.IsIdentifier(name))
        {
            gaps.Add($"Scene slot '{SceneJson.String(slot, "name")}' cannot travel as typed Screenplay: its name is not a Screenplay name.");
            return null;
        }

        var scope = $"slot '{name}'";
        gaps.UnknownMembers(slot, scope, _slotMembers);
        if (!SceneJson.IsEmpty(slot["arrangement"]))
        {
            gaps.Member(scope, "arrangement", "Studio does not carry a slot's arrangement into Screenplay yet");
        }

        SlotRole? role = null;
        if (SceneJson.Has(slot, "role"))
        {
            role = SceneJson.Index(SceneJson.Member(slot, "role"), _slotRoles) is { } index ? (SlotRole)index : null;
            if (role is null)
            {
                gaps.Member(scope, "role", "a slot's role is page, pane or panel");
            }
        }

        // Scene lists the parameters a routed slot is addressed by; Screenplay names one.
        string? routedBy = null;
        if (SceneJson.Has(slot, "routedBy"))
        {
            var parameters = SceneJson.Array(slot, "routedBy");
            routedBy = parameters.Count == 1 && parameters[0] is JsonValue value && value.TryGetValue<string>(out var parameter) && SceneJson.IsIdentifier(parameter) ? parameter : null;
            if (routedBy is null)
            {
                gaps.Member(scope, "routedBy", "a slot is routed by one parameter named by a Screenplay name");
            }
        }

        return new SlotSyntax(name, SourceLocation.Start)
        {
            Role = role,
            Routed = Flag(slot, "routed") || routedBy is not null,
            RoutedBy = routedBy,
            Primary = Flag(slot, "primary"),
            Optional = Flag(slot, "optional")
        };
    }

    static bool Flag(JsonObject owner, string member) => SceneJson.Member(owner, member) is JsonValue value && value.TryGetValue<bool>(out var flag) && flag;

    static List<OutletSyntax> Outlets(JsonObject declaration, string owner, SceneTransportGaps gaps)
    {
        List<OutletSyntax> outlets = [];
        foreach (var outlet in SceneJson.Array(declaration, "outlets"))
        {
            if (outlet is not JsonObject json || SceneJson.String(json, "name") is not { } name || !SceneJson.IsIdentifier(name))
            {
                gaps.Member(owner, "outlets", "every outlet must have a Screenplay name");
                continue;
            }

            var scope = $"{owner} outlet '{name}'";
            gaps.UnknownMembers(json, scope, _outletMembers);
            if (SceneJson.Index(SceneJson.Member(json, "kind"), _outletKinds) is not { } kind)
            {
                gaps.Member(scope, "kind", "an outlet holds actions, filters, tabs, stats or navigation");
                continue;
            }

            ScreenActionSubjectKind? subject = null;
            if (SceneJson.Has(json, "subject"))
            {
                subject = SceneJson.Index(SceneJson.Member(json, "subject"), _outletSubjects) is { } index ? (ScreenActionSubjectKind)index : null;
                if (subject is null)
                {
                    gaps.Member(scope, "subject", "an outlet is for an item or for the screen");
                }
            }

            var items = SceneOutletItems.ToSyntax(SceneJson.Array(json, "defaults"), scope, gaps, asDefaults: true);
            outlets.Add(new OutletSyntax(name, (OutletKind)kind, OutletMode.Unspecified, items, SourceLocation.Start)
            {
                Subject = subject,
                Slot = SceneJson.String(json, "slot")
            });
        }

        return outlets;
    }

    static IReadOnlyList<TemplateSlotContentSyntax> Content(JsonObject template, SceneTransportGaps gaps, bool includeNative)
    {
        var scope = new SceneElementScope(new SceneScreenNames(string.Empty, []), gaps, includeNative);
        return [.. (SceneJson.Object(template, "content") ?? []).Select(slot => new TemplateSlotContentSyntax(slot.Key, SceneNative.Weave(SceneElements.ToDirectives(slot.Value, scope), SceneNative.Of(template, slot.Key), scope), SourceLocation.Start))];
    }

    static JsonObject Declaration(string name, IEnumerable<(SlotSyntax Slot, bool Recursive)> slots, string? type, string? category, bool restrictsScopes, IEnumerable<string> scopes, IEnumerable<OutletSyntax> outlets, ArrangementSyntax? arrangement, IEnumerable<string> sliceKinds)
    {
        var json = new JsonObject
        {
            ["name"] = name,
            ["slots"] = new JsonArray([.. slots.Select(slot => (JsonNode)SlotJson(slot.Slot, slot.Recursive))])
        };

        var metadata = new JsonObject();
        SceneValues.Optional(metadata, "type", type);
        SceneValues.Optional(metadata, "category", category);
        if (restrictsScopes)
        {
            metadata["scopes"] = new JsonArray([.. scopes.Select(scope => (JsonNode?)JsonValue.Create(Capitalized(scope)))]);
        }

        if (sliceKinds.Any())
        {
            metadata["sliceKinds"] = new JsonArray([.. sliceKinds.Select(kind => (JsonNode?)JsonValue.Create(kind))]);
        }

        if (metadata.Count > 0)
        {
            json["metadata"] = metadata;
        }

        if (outlets.Any())
        {
            json["outlets"] = new JsonArray([.. outlets.Select(outlet => (JsonNode)OutletJson(outlet))]);
        }

        if (SceneArrangements.ToJson(arrangement) is { } scene)
        {
            json["arrangement"] = scene;
        }

        return json;
    }

    static JsonObject SlotJson(SlotSyntax slot, bool recursive)
    {
        var json = new JsonObject { ["name"] = slot.Name };
        if (recursive)
        {
            json[RecursiveMember] = true;
        }
        else if ((slot.Routed || slot.RoutedBy is not null) && slot is { Role: null, Primary: false, Optional: false, RoutedBy: null })
        {
            // A routed slot that says nothing else reads as a fill point when nothing says otherwise; this one is a region of the template.
            json[RecursiveMember] = false;
        }

        SceneValues.Optional(json, "role", slot.Role?.ToString().ToLowerInvariant());
        if (slot.Routed || slot.RoutedBy is not null)
        {
            json["routed"] = true;
        }

        if (slot.RoutedBy is { } parameter)
        {
            json["routedBy"] = new JsonArray(JsonValue.Create(parameter));
        }
        if (slot.Primary)
        {
            json["primary"] = true;
        }

        if (slot.Optional)
        {
            json["optional"] = true;
        }

        return json;
    }

    static JsonObject OutletJson(OutletSyntax outlet)
    {
        var json = new JsonObject
        {
            ["name"] = outlet.Name,
            ["kind"] = _outletKinds[(int)(outlet.Kind ?? OutletKind.Actions)]
        };
        SceneValues.Optional(json, "subject", outlet.Subject is { } subject ? _outletSubjects[(int)subject] : null);
        SceneValues.Optional(json, "slot", outlet.Slot);
        json["defaults"] = SceneOutletItems.ToJson(outlet.Items);
        return json;
    }

    static void Describe(JsonObject json, string? displayName, string? description, IEnumerable<TemplateSlotContentSyntax> content)
    {
        SceneValues.Optional(json, "displayName", displayName);
        SceneValues.Optional(json, "description", description);
        var names = new SceneScreenNames(string.Empty, []);
        if (content.Any())
        {
            json["content"] = new JsonObject(content.Select(slot => KeyValuePair.Create(slot.Slot, (JsonNode?)SceneElementImport.ToElements(slot.Directives, names))));
            foreach (var slot in content)
            {
                SceneNative.Attach(json, slot.Slot, SceneNative.Capture(slot.Directives));
            }
        }
    }

    static string Capitalized(string scope) => scope.Length == 0 ? scope : char.ToUpperInvariant(scope[0]) + scope[1..];
}
