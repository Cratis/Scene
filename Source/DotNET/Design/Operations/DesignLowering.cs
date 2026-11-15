// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Lowers a checked operation to the steps that carry it out. Variations, tweaks and refusals change nothing, so they lower to nothing. The TypeScript
/// twin is <c language="text">lowerOperation</c>.
/// </summary>
internal static class DesignLowering
{
    /// <summary>
    /// Lowers an operation to the steps that carry it out.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<LoweredStep> Lower(DesignOperation operation, DesignWorkspace workspace, DesignContext context) => operation switch
    {
        AddScreenOperation add => DeclareScreen(add, workspace, context),
        RemoveScreenOperation remove => [new RemoveScreenStep(remove.Name), new ScreenSetStep("remove", remove.Name)],
        MoveScreenOperation move => [new ScreenSetStep("move", move.Name, move.Index)],
        AddTemplateOperation addTemplate => DeclareTemplate(addTemplate),
        AddSlotOperation or RemoveSlotOperation or ArrangeOperation => ChangeTemplate(operation, workspace),
        InsertOperation or SetOperation or RemoveOperation or MoveOperation or LinkOperation => LowerContent(operation, workspace, context),
        ProfileOperation profile => [new ProfileStep(profile.Key, profile.Value)],
        _ => [],
    };

    static EditingScope ScopeOf(ResolvedTarget target) => new(target.IsScreen ? EditingScopeKind.Screen : EditingScopeKind.ScreenTemplate, target.Name);

    static string OwnerNodeId(ResolvedTarget target) => target.IsScreen ? $"screen:{target.Name}" : $"screenTemplate:{target.Name}";

    static string SlotNodeId(ResolvedTarget target, string outlet) => $"{OwnerNodeId(target)}#slot:{outlet}";

    static JsonObject SlotOf(DesignSlot slot)
    {
        var result = new JsonObject { ["name"] = slot.Name };
        if (slot.Description is not null)
        {
            result["description"] = slot.Description;
        }

        if (slot.Optional is not null)
        {
            result["optional"] = slot.Optional;
        }

        if (slot.Primary is not null)
        {
            result["primary"] = slot.Primary;
        }

        if (slot.Accepts is not null)
        {
            result["accepts"] = new JsonArray([.. slot.Accepts.Select(accept => (JsonNode?)JsonValue.Create(accept))]);
        }

        return result;
    }

    static JsonObject EmptyContent(IEnumerable<string> slots)
    {
        var content = new JsonObject();
        foreach (var slot in slots)
        {
            content[slot] = new JsonArray();
        }

        return content;
    }

    static List<LoweredStep> DeclareScreen(AddScreenOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var inDocument = DocumentLookup.FindByName(workspace.Document.ScreenTemplates, operation.Template);
        var source = inDocument ?? DocumentLookup.FindByName(context.Templates, operation.Template)!;
        var layout = workspace.Profile?.Layout ?? (workspace.Document.Layouts.Count > 0 ? DocumentLookup.Text(JsonNode.Parse(workspace.Document.Layouts[0].GetRawText()), "name") : null) ?? string.Empty;
        var screen = new JsonObject
        {
            ["name"] = operation.Name,
            ["layout"] = layout,
            ["screenTemplate"] = operation.Template,
            ["slotContent"] = EmptyContent(DocumentLookup.SlotNames(source["slots"])),
            ["forms"] = new JsonArray(),
            ["contributions"] = new JsonArray(),
        };
        List<LoweredStep> steps = [];
        if (inDocument is null)
        {
            steps.Add(new DeclareTemplateStep((JsonObject)source.DeepClone()));
        }

        steps.Add(new DeclareScreenStep(screen));
        steps.Add(new ScreenSetStep("add", operation.Name));
        return steps;
    }

    static IReadOnlyList<LoweredStep> DeclareTemplate(AddTemplateOperation operation)
    {
        var template = new JsonObject
        {
            ["name"] = operation.Name,
            ["slots"] = new JsonArray([.. operation.Slots.Select(slot => (JsonNode?)SlotOf(slot))]),
            ["content"] = EmptyContent(operation.Slots.Select(slot => slot.Name)),
        };
        if (operation.FitsSlot is not null)
        {
            template["fitsSlot"] = operation.FitsSlot;
        }

        if (operation.Arrangement is { } arrangement)
        {
            template["arrangement"] = JsonNode.Parse(arrangement.GetRawText());
        }

        if (operation.DisplayName is not null)
        {
            template["displayName"] = operation.DisplayName;
        }

        if (operation.Description is not null)
        {
            template["description"] = operation.Description;
        }

        if (operation.Type is not null)
        {
            template["metadata"] = new JsonObject { ["type"] = operation.Type };
        }

        if (operation.Outlets is not null)
        {
            template["outlets"] = new JsonArray([.. operation.Outlets.Select(outlet => JsonNode.Parse(outlet.GetRawText()))]);
        }

        return [new DeclareTemplateStep(template)];
    }

    static IReadOnlyList<LoweredStep> ChangeTemplate(DesignOperation operation, DesignWorkspace workspace)
    {
        var name = operation.TargetTemplate()!;
        var template = (JsonObject)DocumentLookup.FindByName(workspace.Document.ScreenTemplates, name)!.DeepClone();
        var slots = (JsonArray)template["slots"]!;
        var content = template["content"] as JsonObject ?? [];
        switch (operation)
        {
            case ArrangeOperation arrange:
                template["arrangement"] = JsonNode.Parse(arrange.Arrangement.GetRawText());
                break;
            case RemoveSlotOperation remove:
                content.Remove(remove.Slot);
                template["slots"] = new JsonArray([.. slots.Where(slot => DocumentLookup.Text(slot, "name") != remove.Slot).Select(slot => slot!.DeepClone())]);
                template["content"] = content.DeepClone();
                break;
            case AddSlotOperation add:
                {
                    var position = add.Index is null ? slots.Count : Math.Max(0, Math.Min(slots.Count, add.Index.Value));
                    var all = slots.Select(slot => slot!.DeepClone()).ToList();
                    all.Insert(position, SlotOf(add.Slot));
                    content[add.Slot.Name] = new JsonArray();
                    template["slots"] = new JsonArray([.. all]);
                    template["content"] = content.DeepClone();
                    break;
                }
        }

        return [new DeclareTemplateStep(template)];
    }

    static IReadOnlyList<LoweredStep> LowerContent(DesignOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var target = DocumentLookup.ResolveTarget(workspace.Document, operation.TargetScreen(), operation.TargetTemplate())!;
        var scope = ScopeOf(target);
        switch (operation)
        {
            case InsertOperation insert:
                {
                    var component = DesignCatalogueLookup.FindComponent(context.Catalogue, insert.Component)!;
                    var properties = new JsonObject();
                    foreach (var (name, value) in insert.Props ?? new Dictionary<string, JsonElement>())
                    {
                        properties[name] = DesignValues.ToSceneValue(component, name, value);
                    }

                    var id = insert.Id ?? DocumentLookup.NewElementId(component.Name, DocumentLookup.IdsInDocument(workspace.Document));
                    var element = DocumentLookup.CreateComponentElement(id, component.Name, properties);
                    return [new SceneEditStep(scope, new InsertNodeEdit(SlotNodeId(target, insert.Outlet), null, insert.Index, JsonSerializer.SerializeToElement(element)))];
                }

            case SetOperation set:
                {
                    var component = DesignCatalogueLookup.FindComponent(context.Catalogue, DocumentLookup.ComponentNameOf(DocumentLookup.FindElement(target, set.Element)!.Element))!;
                    return [new SceneEditStep(scope, new SetPropertyEdit($"element:{set.Element}", set.Prop, ToElement(DesignValues.ToSceneValue(component, set.Prop, set.Value))))];
                }

            case RemoveOperation remove:
                return [new SceneEditStep(scope, new RemoveNodeEdit($"element:{remove.Element}"))];
            case MoveOperation move:
                return [new SceneEditStep(scope, new MoveNodeEdit($"element:{move.Element}", SlotNodeId(target, move.Outlet), null, move.Index))];
            case LinkOperation link:
                {
                    var component = DesignCatalogueLookup.FindComponent(context.Catalogue, DocumentLookup.ComponentNameOf(DocumentLookup.FindElement(target, link.Element)!.Element))!;
                    var prop = link.Prop ?? component.Properties.First(property => property.Kind == DesignValueKind.Destination).Name;
                    var destination = JsonSerializer.SerializeToElement(new JsonObject { ["screen"] = link.To });
                    return [new SceneEditStep(scope, new SetPropertyEdit($"element:{link.Element}", prop, destination))];
                }

            default:
                return [];
        }
    }

    static JsonElement? ToElement(JsonNode? node) => node is null ? null : JsonSerializer.SerializeToElement(node);
}
