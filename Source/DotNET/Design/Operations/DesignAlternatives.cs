// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Finds the nearest operations that would be accepted when one is refused. The TypeScript twin is <c language="text">alternativesFor</c>.
/// </summary>
internal static class DesignAlternatives
{
    /// <summary>
    /// Finds the nearest operations that would be accepted instead of a refused one.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <param name="refusal">The refusal.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<DesignAlternative> For(DesignOperation operation, DesignRefusal refusal, DesignWorkspace workspace, DesignContext context)
    {
        switch (refusal.Code)
        {
            case DesignRefusalCode.OutletUnknown:
            case DesignRefusalCode.OutletDoesNotAccept:
            case DesignRefusalCode.OutletFull:
                return refusal.Homes is null
                    ? []
                    : operation switch
                    {
                        InsertOperation insert => [.. refusal.Homes.Take(2).Select(home => new DesignAlternative($"Put it in {home}", [insert with { Outlet = home }]))],
                        MoveOperation move => [.. refusal.Homes.Take(2).Select(home => new DesignAlternative($"Put it in {home}", [move with { Outlet = home }]))],
                        _ => [],
                    };
            case DesignRefusalCode.TemplateNotInSet:
            case DesignRefusalCode.TemplateNotInCatalogue:
                return ForTemplate(operation, workspace, context);
            case DesignRefusalCode.QueryUnknown:
                return operation is SetOperation setQuery
                    ? [.. context.Catalogue.Queries.Take(2).Select(query => new DesignAlternative($"Use the query {query.Name}", [setQuery with { Value = JsonSerializer.SerializeToElement(query.Name) }]))]
                    : [];
            case DesignRefusalCode.ValueNotAllowed:
            case DesignRefusalCode.VariantNotInDesignSystem:
                return ForValue(operation, refusal, workspace, context);
            case DesignRefusalCode.ProfileValueNotAllowed:
                return operation is ProfileOperation profile
                    ? [.. (DesignProfileOperations.KeyValues(context.Catalogue, profile.Key) ?? []).Take(2).Select(value => new DesignAlternative($"Use {value}", [profile with { Value = value }]))]
                    : [];
            case DesignRefusalCode.FreeStylingNotAllowed:
            case DesignRefusalCode.OffSystemValue:
                return ForOffSystem(operation, refusal, workspace, context);
            default:
                return [];
        }
    }

    static DesignOperation? WithTemplate(DesignOperation operation, string template) => operation switch
    {
        InsertOperation insert => insert with { Template = template },
        SetOperation set => set with { Template = template },
        RemoveOperation remove => remove with { Template = template },
        MoveOperation move => move with { Template = template },
        LinkOperation link => link with { Template = template },
        _ => null,
    };

    static IReadOnlyList<DesignAlternative> ForTemplate(DesignOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var listed = context.Catalogue.Templates.Select(template => template.Name).Take(3).ToList();
        switch (operation)
        {
            case AddScreenOperation add:
                return [.. listed.Select(template => new DesignAlternative($"Use {template}", [add with { Template = template }]))];
            case VariationsOperation variations:
                return listed.Count == 0 ? [] : [new DesignAlternative("Offer variations on the templates of the design", [variations with { Templates = listed }])];
            case AddTemplateOperation:
                return [.. listed.Select(template => new DesignAlternative($"Use {template} as it is", []))];
            default:
                if (operation.TargetTemplate() is not null)
                {
                    var inDocument = (context.Catalogue.TemplateSet ?? [])
                        .Where(name => DocumentLookup.FindByName(workspace.Document.ScreenTemplates, name) is not null)
                        .Take(3);
                    return [.. inDocument.Select(template => new DesignAlternative($"Change {template} instead", [WithTemplate(operation, template)!]))];
                }

                return [];
        }
    }

    static (DesignComponentEntry? Component, string? Prop) SetTarget(SetOperation set, DesignWorkspace workspace, DesignContext context)
    {
        var target = DocumentLookup.ResolveTarget(workspace.Document, set.Screen, set.Template);
        var place = target is null ? null : DocumentLookup.FindElement(target, set.Element);
        return (place is null ? null : DesignCatalogueLookup.FindComponent(context.Catalogue, DocumentLookup.ComponentNameOf(place.Element)), set.Prop);
    }

    static List<DesignAlternative> ForValue(DesignOperation operation, DesignRefusal refusal, DesignWorkspace workspace, DesignContext context)
    {
        if (operation is InsertOperation insert)
        {
            return ForInsertValue(insert, refusal, context);
        }

        if (operation is not SetOperation set)
        {
            return [];
        }

        var (component, prop) = SetTarget(set, workspace, context);
        var choices = component?.Properties.FirstOrDefault(property => property.Name == prop)?.Choices ?? [];
        var alternatives = choices.Take(2).Select(choice => new DesignAlternative($"Use {JsText.Of(choice)}", [set with { Value = choice }])).ToList();
        if (refusal.Code == DesignRefusalCode.VariantNotInDesignSystem && component is not null)
        {
            var value = JsText.Of(set.Value);
            alternatives.Add(new DesignAlternative("Propose it to the design system", null, new DesignSystemProposal("variant", $"Add the {value} variant of {component.Label}", null, component.Label, value)));
        }

        return alternatives;
    }

    /// <summary>
    /// Finds the alternatives to an insert whose property does not take its value: the choices the property does take, the component without it,
    /// and - for a variant - a proposal.
    /// </summary>
    /// <param name="insert">The insert.</param>
    /// <param name="refusal">Why it was refused.</param>
    /// <param name="context">The context.</param>
    /// <returns>The alternatives.</returns>
    static List<DesignAlternative> ForInsertValue(InsertOperation insert, DesignRefusal refusal, DesignContext context)
    {
        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, insert.Component);
        if (component is null)
        {
            return [];
        }

        var props = (insert.Props ?? new Dictionary<string, JsonElement>()).ToList();
        var offending = props.Where(pair => DesignValues.CheckProperty(component, pair.Key, pair.Value, context.Catalogue)?.Code == refusal.Code).Cast<KeyValuePair<string, JsonElement>?>().FirstOrDefault();
        if (offending is null)
        {
            return [];
        }

        var (name, value) = offending.Value;
        var rest = props.Where(pair => pair.Key != name).ToDictionary(pair => pair.Key, pair => pair.Value);
        var choices = component.Properties.FirstOrDefault(property => property.Name == name)?.Choices ?? [];
        var alternatives = choices
            .Take(2)
            .Select(choice => new DesignAlternative($"Use {JsText.Of(choice)}", [insert with { Props = props.ToDictionary(pair => pair.Key, pair => pair.Key == name ? choice : pair.Value) }]))
            .ToList();
        alternatives.Add(new DesignAlternative($"Add {component.Label} without {name}", [insert with { Props = rest }]));
        if (refusal.Code == DesignRefusalCode.VariantNotInDesignSystem)
        {
            var asked = JsText.Of(value);
            alternatives.Add(new DesignAlternative("Propose it to the design system", null, new DesignSystemProposal("variant", $"Add the {asked} variant of {component.Label}", null, component.Label, asked)));
        }

        return alternatives;
    }

    static DesignSystemProposal VariantProposal(DesignComponentEntry component, string prop) =>
        new("variant", $"Add a variant of {component.Label} for {prop}", Component: component.Label);

    static IReadOnlyList<DesignAlternative> ForOffSystem(DesignOperation operation, DesignRefusal refusal, DesignWorkspace workspace, DesignContext context)
    {
        if (operation is SetOperation set)
        {
            var (component, _) = SetTarget(set, workspace, context);
            if (component is null)
            {
                return [];
            }

            var variantProperty = component.Anatomy?.VariantProperty;
            var variants = component.Anatomy?.Variants ?? [];
            var alternatives = variantProperty is null
                ? []
                : variants.Take(2).Select(variant => new DesignAlternative($"Use the {variant} variant", [set with { Prop = variantProperty, Value = JsonSerializer.SerializeToElement(variant) }])).ToList();
            var proposal = refusal.Code == DesignRefusalCode.OffSystemValue || DesignValues.IsColourProperty(set.Prop)
                ? DesignProfileOperations.TokenProposal(JsText.Of(set.Value))
                : VariantProposal(component, set.Prop);
            return [.. alternatives, new DesignAlternative("Propose it to the design system", null, proposal)];
        }

        if (operation is InsertOperation insert)
        {
            var component = DesignCatalogueLookup.FindComponent(context.Catalogue, insert.Component);
            if (component is null)
            {
                return [];
            }

            var props = (insert.Props ?? new Dictionary<string, JsonElement>()).ToList();
            var offending = props.Where(pair => DesignValues.CheckProperty(component, pair.Key, pair.Value, context.Catalogue)?.Code == refusal.Code).Cast<KeyValuePair<string, JsonElement>?>().FirstOrDefault();
            if (offending is null)
            {
                return [];
            }

            var rest = props.Where(pair => pair.Key != offending.Value.Key).ToDictionary(pair => pair.Key, pair => pair.Value);
            var proposal = refusal.Code == DesignRefusalCode.OffSystemValue || DesignValues.IsColourProperty(offending.Value.Key)
                ? DesignProfileOperations.TokenProposal(JsText.Of(offending.Value.Value))
                : VariantProposal(component, offending.Value.Key);
            return
            [
                new DesignAlternative($"Add {component.Label} without {offending.Value.Key}", [insert with { Props = rest }]),
                new DesignAlternative("Propose it to the design system", null, proposal),
            ];
        }

        return [];
    }
}
