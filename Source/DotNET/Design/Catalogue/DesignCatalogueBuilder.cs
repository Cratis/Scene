// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// Builds the catalogue a design is grounded in. Deterministic: the same input always gives the same catalogue, in the order the input lists things, so
/// a tool that answers from it never invents a component, template, token or variant. The TypeScript twin is <c language="text">buildDesignCatalogue</c>.
/// </summary>
public static partial class DesignCatalogueBuilder
{
    static readonly string[] _variantPropertyNames = ["variant", "emphasis"];

    /// <summary>
    /// Gets the part of a component id after the package: <c language="text">Cratis.Blueprint.Default:Button</c> is <c language="text">Button</c>.
    /// </summary>
    /// <param name="name">The component id.</param>
    /// <returns>The bare name.</returns>
    public static string BareComponentName(string name) => name[(name.LastIndexOf(':') + 1)..];

    /// <summary>
    /// Gets a name compared without case or separators, the way a design system's component is matched to a Scene component.
    /// </summary>
    /// <param name="name">The name.</param>
    /// <returns>The normalized name.</returns>
    public static string NormalizeName(string name) => Separators().Replace(name.ToLowerInvariant(), string.Empty);

    /// <summary>
    /// Builds the catalogue of an input.
    /// </summary>
    /// <param name="input">What to build it from.</param>
    /// <returns>The catalogue.</returns>
    public static DesignCatalogue Build(DesignCatalogueInput input)
    {
        var shellComponents = input.ShellComponents ?? [];
        var byId = new Dictionary<string, DesignComponentEntry>(StringComparer.Ordinal);
        var order = new List<string>();
        foreach (var descriptor in input.Descriptors)
        {
            if (!byId.ContainsKey(descriptor.Component))
            {
                order.Add(descriptor.Component);
            }

            byId[descriptor.Component] = ComponentEntry(descriptor, input.DesignSystem, shellComponents);
        }

        List<DesignComponentEntry> components = [.. order.Select(id => byId[id])];
        var allowed = input.TemplateSet is null ? null : new HashSet<string>(input.TemplateSet, StringComparer.Ordinal);
        List<JsonObject> parsed = [.. input.Templates.Select(template => JsonNode.Parse(template.GetRawText())!.AsObject())];
        var listed = parsed.FindAll(template => !IsRoot(template) && allowed?.Contains(Text(template, "name")!) != false);
        List<DesignTemplateEntry> templates =
        [
            .. listed.Select(template => TemplateEntry(template, input.OutletRules is not null && input.OutletRules.TryGetValue(Text(template, "name")!, out var rules) ? rules : null, components)),
        ];

        List<DesignComponentEntry> withFits =
        [
            .. components.Select(component => component with
            {
                Fits = [.. templates.SelectMany(template => template.Outlets
                    .Where(outlet => DesignCatalogueLookup.Accepts(outlet, component))
                    .Select(outlet => $"{template.Name}.{outlet.Name}"))],
            }),
        ];

        var themes = ThemeEntries(input);
        var values = new DesignProfileValues(
            ["Light", "Dark", "System"],
            ["Sharp", "Default", "Round"],
            [.. input.Fonts ?? []],
            [.. themes.Select(theme => theme.Name)],
            [.. parsed.Where(IsRoot).Select(template => Text(template, "name")!)],
            [.. templates.Select(template => template.Name)]);

        var catalogue = new DesignCatalogue(
            input.DesignSystem is null ? [] : TokenEntries(input.DesignSystem),
            input.DesignSystem is null ? [] : DesignComponentEntries(input.DesignSystem, withFits),
            themes,
            withFits,
            templates,
            ShapeEntries(input),
            [.. (input.Queries ?? []).Select(query => new DesignQueryEntry(
                query.Id,
                query.Name,
                Word(query.ResultShape),
                [.. query.ResultFields.Select(field => new DesignFieldEntry(field.Name, field.Type))],
                [.. query.Parameters.Select(parameter => parameter.Name)]))],
            [.. (input.Commands ?? []).Select(command => new DesignCommandEntry(command.Id, command.Name, [.. command.Inputs]))]);

        if (input.DesignSystem is not null)
        {
            catalogue = catalogue with { DesignSystem = input.DesignSystem.Name, Words = input.DesignSystem.Words };
        }

        if (input.Profile is not null)
        {
            catalogue = catalogue with
            {
                Profile = new DesignProfileEntry(input.Profile.Name, [.. input.Profile.Packages], values, input.Profile.Theme, input.Profile.Layout, input.Profile.Root?.Template.Id),
            };
        }

        return input.TemplateSet is null ? catalogue : catalogue with { TemplateSet = [.. input.TemplateSet] };
    }

    [GeneratedRegex(@"[\s._-]", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Separators();

    static bool IsRoot(JsonObject template) => Text(template["metadata"], "role") == "Root";

    static string? Text(JsonNode? node, string property) => node is JsonObject obj && obj[property] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    /// <summary>
    /// Writes an enumeration value as the word it goes by on the wire, as the TypeScript model writes it.
    /// </summary>
    /// <typeparam name="T">The enumeration.</typeparam>
    /// <param name="value">The value.</param>
    /// <returns>The word.</returns>
    static string Word<T>(T value)
        where T : struct, Enum => JsonSerializer.SerializeToNode(value, SceneJson.Options)!.GetValue<string>();

    static JsonElement Element(string value) => JsonSerializer.SerializeToElement(value);

    static DesignValueKind KindOf(PropertyDescriptor property) => property.ValueType switch
    {
        PropertyValueType.String => property.Choices is { Count: > 0 } ? DesignValueKind.Choice : DesignValueKind.Text,
        PropertyValueType.Number => DesignValueKind.Number,
        PropertyValueType.Boolean => DesignValueKind.Boolean,
        PropertyValueType.Enum => DesignValueKind.Choice,
        PropertyValueType.Icon => DesignValueKind.Icon,
        PropertyValueType.Destination => DesignValueKind.Destination,
        PropertyValueType.QueryReference => DesignValueKind.Query,
        PropertyValueType.Collection => DesignValueKind.List,
        PropertyValueType.Object => DesignValueKind.Object,
        _ => DesignValueKind.Json,
    };

    static DesignComponent? BoundDesignComponent(ComponentDescriptor descriptor, DesignSystem? designSystem)
    {
        if (designSystem is null)
        {
            return null;
        }

        return designSystem.Components.FirstOrDefault(candidate => candidate.Mapping?.MapsTo == descriptor.Component)
            ?? designSystem.Components.FirstOrDefault(candidate => NormalizeName(candidate.Name) == NormalizeName(BareComponentName(descriptor.Component)));
    }

    static List<string> Intersect(IReadOnlyList<string> declared, IEnumerable<string> allowed)
    {
        var set = allowed.ToHashSet(StringComparer.Ordinal);
        return [.. declared.Where(set.Contains)];
    }

    static DesignAnatomyEntry? ResolveAnatomy(ComponentDescriptor descriptor, DesignSystem? designSystem)
    {
        var anatomy = descriptor.Anatomy;
        if (anatomy is null)
        {
            return null;
        }

        var bound = BoundDesignComponent(descriptor, designSystem);
        var variantProperty = bound?.Mapping?.VariantProperty
            ?? anatomy.VariantProperty
            ?? _variantPropertyNames.FirstOrDefault(name => descriptor.Properties.Any(property => property.Path == name));
        var resolved = new DesignAnatomyEntry([.. anatomy.Parts], [.. anatomy.Variants], [.. anatomy.States]);
        if (bound is not null)
        {
            string VariantValue(string name) => bound.Mapping?.VariantValues is not null && bound.Mapping.VariantValues.TryGetValue(name, out var mapped) ? mapped : name;
            resolved = resolved with
            {
                Parts = Intersect(anatomy.Parts, bound.Parts),
                Variants = Intersect(anatomy.Variants, bound.Variants.Select(variant => VariantValue(variant.Name))),
                States = Intersect(anatomy.States, bound.Variants.SelectMany(variant => variant.States?.Keys ?? [])),
                DesignSystemComponent = bound.Name,
            };
        }

        return variantProperty is null ? resolved : resolved with { VariantProperty = variantProperty };
    }

    static DesignPropertyEntry PropertyEntry(PropertyDescriptor property, DesignAnatomyEntry? anatomy)
    {
        var entry = new DesignPropertyEntry(property.Path, property.Label, KindOf(property));
        if (property.Choices is { Count: > 0 })
        {
            entry = entry with { Choices = [.. property.Choices.Select(choice => choice.Value)] };
        }

        if (anatomy?.VariantProperty == property.Path && anatomy.Variants.Count > 0)
        {
            entry = entry with { Kind = DesignValueKind.Choice, Choices = [.. anatomy.Variants.Select(Element)] };
        }

        return entry with
        {
            Required = property.Constraints?.Required == true ? true : null,
            Description = property.Description,
            Minimum = property.Constraints?.Minimum,
            Maximum = property.Constraints?.Maximum,
        };
    }

    static DesignPlacement PlacementOf(ComponentDescriptor descriptor, IReadOnlyList<string> shellComponents)
    {
        if (descriptor.Category == "Overlay")
        {
            return DesignPlacement.Overlay;
        }

        return descriptor.Category == "Shell" || shellComponents.Contains(descriptor.Component) || shellComponents.Contains(BareComponentName(descriptor.Component))
            ? DesignPlacement.Shell
            : DesignPlacement.Outlet;
    }

    static DesignComponentEntry ComponentEntry(ComponentDescriptor descriptor, DesignSystem? designSystem, IReadOnlyList<string> shellComponents)
    {
        var anatomy = ResolveAnatomy(descriptor, designSystem);
        return new DesignComponentEntry(
            descriptor.Component,
            descriptor.DisplayName ?? BareComponentName(descriptor.Component),
            descriptor.Category ?? string.Empty,
            PlacementOf(descriptor, shellComponents),
            [.. descriptor.Properties.Select(property => PropertyEntry(property, anatomy))],
            [],
            descriptor.Component.Contains(':') ? descriptor.Component[..descriptor.Component.IndexOf(':')] : null,
            descriptor.Description,
            anatomy);
    }

    static string ResolveComponentName(string name, List<DesignComponentEntry> components)
    {
        var exact = components.FirstOrDefault(component => component.Name == name);
        if (exact is not null)
        {
            return exact.Name;
        }

        var matches = components.Where(component => NormalizeName(BareComponentName(component.Name)) == NormalizeName(name)).ToList();
        return matches.Count == 1 ? matches[0].Name : name;
    }

    static List<DesignOutletRule> OutletRulesOf(JsonObject template, IReadOnlyDictionary<string, DesignOutletRuleInput>? rules, List<DesignComponentEntry> components)
    {
        var content = template["content"] as JsonObject;
        var result = new List<DesignOutletRule>();
        foreach (var slot in template["slots"]!.AsArray())
        {
            var slotName = Text(slot, "name")!;
            DesignOutletRuleInput? explicitRule = null;
            rules?.TryGetValue(slotName, out explicitRule);
            var named = (content?[slotName] as JsonArray ?? [])
                .Select(element => Text(element, "componentName"))
                .OfType<string>()
                .Select(name => ResolveComponentName(name, components))
                .Distinct()
                .ToList();
            var derived = named
                .Select(name => components.FirstOrDefault(component => component.Name == name)?.Category)
                .Where(category => !string.IsNullOrEmpty(category))
                .Select(category => category!)
                .Distinct()
                .ToList();
            result.Add(new DesignOutletRule(
                slotName,
                explicitRule?.Components ?? named,
                explicitRule?.Categories ?? derived,
                explicitRule is null && named.Count == 0,
                explicitRule?.Max));
        }

        return result;
    }

    static DesignTemplateEntry TemplateEntry(JsonObject template, IReadOnlyDictionary<string, DesignOutletRuleInput>? rules, List<DesignComponentEntry> components)
    {
        var metadata = template["metadata"];
        return new DesignTemplateEntry(
            Text(template, "name")!,
            OutletRulesOf(template, rules, components),
            Text(template, "displayName") ?? Text(metadata, "displayName"),
            Text(template, "description") ?? Text(metadata, "description"),
            Text(metadata, "type"),
            Text(metadata, "category"),
            Text(template, "fitsSlot"));
    }

    static List<DesignTokenEntry> TokenEntries(DesignSystem designSystem) =>
        [.. designSystem.Tokens.Select(role =>
        {
            var address = $"{role.Category}.{role.Name}";
            return new DesignTokenEntry(
                address,
                role.Category,
                role.Name,
                [.. designSystem.Themes.SelectMany(theme => theme.Modes
                    .Where(mode => mode.Tokens.ContainsKey(address))
                    .Select(mode => new DesignTokenValue(theme.Name, mode.Mode, mode.Tokens[address])))],
                role.Description);
        })];

    static List<DesignSystemComponentEntry> DesignComponentEntries(DesignSystem designSystem, List<DesignComponentEntry> components) =>
        [.. designSystem.Components.Select(component => new DesignSystemComponentEntry(
            component.Name,
            [.. component.Parts],
            [.. component.Variants.Select(variant => new DesignVariantEntry(variant.Name, [.. variant.States?.Keys ?? []]))],
            component.Mapping?.MapsTo,
            components.FirstOrDefault(candidate => candidate.Anatomy?.DesignSystemComponent == component.Name)?.Name))];

    static List<DesignThemeEntry> ThemeEntries(DesignCatalogueInput input)
    {
        var themes = (input.DesignSystem?.Themes ?? []).Select(theme =>
            new DesignThemeEntry(theme.Name, DesignThemeSource.DesignSystem, [.. theme.Modes.Select(mode => mode.Mode)], null, theme.IsDefault ? true : null)).ToList();
        foreach (var theme in input.Themes ?? [])
        {
            if (themes.Exists(existing => existing.Name == theme.Name))
            {
                continue;
            }

            themes.Add(new DesignThemeEntry(theme.Name, DesignThemeSource.Package, [], theme.IsDark ? true : null));
        }

        return themes;
    }

    static List<DesignShapeEntry> ShapeEntries(DesignCatalogueInput input) =>
    [
        .. (input.Shapes ?? []).Select(shape => new DesignShapeEntry(shape.Name, DesignShapeSource.Shape, [.. shape.Fields.Select(field => new DesignFieldEntry(field.Name, field.Type))])),
        .. (input.SampleData ?? []).Select(shape => new DesignShapeEntry(
            shape.Name,
            DesignShapeSource.SampleData,
            [.. shape.Fields.Select(field => new DesignFieldEntry(field.Name, field.Type ?? (field.Kind is { } kind ? Word(kind) : null)))])),
    ];
}
