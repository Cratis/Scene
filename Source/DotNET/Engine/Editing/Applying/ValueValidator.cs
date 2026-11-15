// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Descriptors;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Checks that a value fits the property it is for: its type, its limits, and for collections and objects the fields inside it.
/// </summary>
static class ValueValidator
{
    const int MaximumJsonDepth = 64;

    static readonly HashSet<string> _bindingKinds = [.. Enum.GetValues<BindingSourceKind>().Select(LayoutTypeNames.Of)];

    /// <summary>
    /// Checks a value against a property's descriptor.
    /// </summary>
    /// <param name="descriptor">The descriptor of the property.</param>
    /// <param name="value">The value, which is <see langword="null"/> when there is none.</param>
    /// <returns>What is wrong with it, or <see langword="null"/> when it fits.</returns>
    public static string? Validate(PropertyDescriptor descriptor, JsonNode? value)
    {
        var constraints = descriptor.Constraints ?? new PropertyConstraints();
        if (value is null)
        {
            return constraints.Required == true ? "a value is required" : null;
        }

        var binding = BindingKindOf(value);
        if (binding is not null && descriptor.AcceptedBindingKinds is not null)
        {
            var accepted = descriptor.AcceptedBindingKinds.Select(LayoutTypeNames.Of).ToList();
            return accepted.Contains(binding)
                ? null
                : $"a {binding} binding is not accepted here; use {string.Join(" or ", accepted)}";
        }

        switch (descriptor.ValueType)
        {
            case PropertyValueType.String:
                return ValidateString(constraints, value);

            case PropertyValueType.Number:
                return ValidateNumber(constraints, value);

            case PropertyValueType.Boolean:
                return Data.TryBoolean(value, out _) ? null : "expected true or false";

            case PropertyValueType.Enum:
                return (descriptor.Choices ?? []).Any(choice => ChoiceMatches(choice.Value, value)) ? null : "not one of the allowed choices";

            case PropertyValueType.Icon:
                if (value is not JsonObject || !NonEmpty(Data.Get(value, "library")) || !NonEmpty(Data.Get(value, "key")))
                {
                    return "expected an icon reference with a library and a key";
                }

                return !Data.Has(value, "variant") || (Data.Get(value, "variant") is JsonValue variant && variant.GetValueKind() == JsonValueKind.String)
                    ? null
                    : "the icon variant must be a string";

            case PropertyValueType.Destination:
                if (value is not JsonObject || !NonEmpty(Data.Get(value, "screen")))
                {
                    return "expected a destination naming a screen";
                }

                return !Data.Has(value, "routeParameterBindings") || Data.Get(value, "routeParameterBindings") is JsonObject
                    ? null
                    : "routeParameterBindings must be an object";

            case PropertyValueType.QueryReference:
                if (NonEmpty(value))
                {
                    return null;
                }

                if (value is not JsonObject || !NonEmpty(Data.Get(value, "queryId")) || !NonEmpty(Data.Get(value, "query")))
                {
                    return "expected a query name or a query binding";
                }

                return Data.Get(value, "arguments") is JsonArray && Data.Get(value, "results") is JsonArray ? null : "a query binding needs arguments and results lists";

            case PropertyValueType.Collection:
                return ValidateCollection(descriptor, value);

            case PropertyValueType.Object:
                return ValidateObject(descriptor, value);

            case PropertyValueType.Json:
                return IsJsonValue(value, 0) ? null : "expected a JSON value";

            default:
                return value is JsonObject or JsonArray ? null : "expected a structured value";
        }
    }

    /// <summary>
    /// Checks the fields of one item of a collection.
    /// </summary>
    /// <param name="itemDescriptor">What the items look like.</param>
    /// <param name="values">The item's field values, without its id.</param>
    /// <returns>What is wrong, in the order found.</returns>
    public static IReadOnlyList<ItemFieldProblem> ValidateItemValues(CollectionItemDescriptor? itemDescriptor, JsonObject values) =>
        ValidateFields(itemDescriptor?.Properties ?? [], values, "this collection's items", itemDescriptor?.Open == true);

    static string? ValidateString(PropertyConstraints constraints, JsonNode value)
    {
        if (Data.AsText(value) is not { } text)
        {
            return "expected a string";
        }

        if (constraints.MinimumLength is { } minimumLength && text.Length < minimumLength)
        {
            return $"must be at least {minimumLength} characters";
        }

        if (constraints.MaximumLength is { } maximumLength && text.Length > maximumLength)
        {
            return $"must be at most {maximumLength} characters";
        }

        if (constraints.Pattern is { } pattern && !Regex.IsMatch(text, $"^(?:{pattern})\\z", RegexOptions.None, TimeSpan.FromSeconds(1)))
        {
            return $"must match {pattern}";
        }

        return null;
    }

    static string? ValidateNumber(PropertyConstraints constraints, JsonNode value)
    {
        if (!Data.TryNumber(value, out var number))
        {
            return "expected a number";
        }

        if (constraints.Integer == true && Math.Floor(number) != number)
        {
            return "expected a whole number";
        }

        if (constraints.Minimum is { } minimum && number < minimum)
        {
            return $"must be at least {Data.Format(minimum)}";
        }

        if (constraints.Maximum is { } maximum && number > maximum)
        {
            return $"must be at most {Data.Format(maximum)}";
        }

        return null;
    }

    static string? ValidateObject(PropertyDescriptor descriptor, JsonNode value)
    {
        if (descriptor.Properties is null)
        {
            return value is JsonObject or JsonArray ? null : "expected a structured value";
        }

        if (value is not JsonObject record)
        {
            return "expected a structured value";
        }

        var problems = ValidateFields(descriptor.Properties, record, "this object", descriptor.Open == true);
        return problems.Count == 0 ? null : $"{problems[0].Field} {problems[0].Problem}";
    }

    static string? ValidateCollection(PropertyDescriptor descriptor, JsonNode value)
    {
        if (value is not JsonArray list)
        {
            return "expected a list";
        }

        var constraints = descriptor.Constraints ?? new PropertyConstraints();
        if (constraints.MinimumItems is { } minimumItems && list.Count < minimumItems)
        {
            return $"needs at least {minimumItems} items";
        }

        if (constraints.MaximumItems is { } maximumItems && list.Count > maximumItems)
        {
            return $"allows at most {maximumItems} items";
        }

        var identities = new HashSet<string>(StringComparer.Ordinal);
        var positional = descriptor.Item?.Positional == true;
        for (var index = 0; index < list.Count; index++)
        {
            if (positional)
            {
                if (list[index] is not JsonObject positionalItem)
                {
                    return $"item {index + 1} is not a record";
                }

                var positionalProblems = ValidateItemValues(descriptor.Item, WithoutId(positionalItem));
                if (positionalProblems.Count > 0)
                {
                    return $"item {index + 1}: {positionalProblems[0].Field} {positionalProblems[0].Problem}";
                }

                continue;
            }

            if (list[index] is not JsonObject item || Data.Text(item, "id") is not { Length: > 0 } id)
            {
                return "every item needs an id";
            }

            if (!identities.Add(id))
            {
                return $"the item id '{id}' is used twice";
            }

            var problems = ValidateItemValues(descriptor.Item, WithoutId(item));
            if (problems.Count > 0)
            {
                return $"item '{id}': {problems[0].Field} {problems[0].Problem}";
            }
        }

        return null;
    }

    static JsonObject WithoutId(JsonObject item)
    {
        var values = new JsonObject();
        foreach (var (name, node) in item)
        {
            if (name != "id")
            {
                values[name] = Data.Clone(node);
            }
        }

        return values;
    }

    static List<ItemFieldProblem> ValidateFields(IReadOnlyList<PropertyDescriptor> fields, JsonObject values, string owner, bool open)
    {
        var problems = new List<ItemFieldProblem>();
        foreach (var (field, fieldValue) in values)
        {
            var fieldDescriptor = fields.FirstOrDefault(candidate => candidate.Path == field);
            if (fieldDescriptor is null)
            {
                if (!open)
                {
                    problems.Add(new(field, $"is not a field of {owner}"));
                }

                continue;
            }

            var problem = Validate(fieldDescriptor, fieldValue);
            if (problem is not null)
            {
                problems.Add(new(field, problem));
            }
        }

        foreach (var fieldDescriptor in fields)
        {
            if (fieldDescriptor.Constraints?.Required == true && !values.ContainsKey(fieldDescriptor.Path))
            {
                problems.Add(new(fieldDescriptor.Path, "a value is required"));
            }
        }

        return problems;
    }

    static bool NonEmpty(JsonNode? node) => Data.AsText(node) is { Length: > 0 };

    static string? BindingKindOf(JsonNode value)
    {
        if (value is not JsonObject || Data.Text(value, "kind") is not { } kind || !_bindingKinds.Contains(kind) || Data.Text(value, "path") is null)
        {
            return null;
        }

        return kind;
    }

    static bool ChoiceMatches(JsonElement choice, JsonNode value) => choice.ValueKind switch
    {
        JsonValueKind.String => Data.AsText(value) == choice.GetString(),
        JsonValueKind.Number => Data.TryNumber(value, out var number) && choice.GetDouble() == number,
        _ => false
    };

    static bool IsJsonValue(JsonNode? value, int depth)
    {
        switch (value)
        {
            case JsonObject record:
                return depth < MaximumJsonDepth && record.All(entry => IsJsonValue(entry.Value, depth + 1));

            case JsonArray list:
                return depth < MaximumJsonDepth && list.All(item => IsJsonValue(item, depth + 1));

            default:
                return true;
        }
    }
}
