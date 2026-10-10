// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Validates bindings with the same codes, messages and order as the TypeScript <c language="csharp">validateBindingExpression</c>.
/// </summary>
public static class BindingValidation
{
    /// <summary>
    /// Validates one binding against the available scope and the component dependency stack.
    /// </summary>
    /// <param name="binding">The binding.</param>
    /// <param name="scope">The values available.</param>
    /// <param name="targetElementId">The id of the element the binding belongs to.</param>
    /// <param name="resolvingElementIds">The ids of the elements whose bindings are being resolved, outermost first.</param>
    /// <returns>The problems found.</returns>
    public static IReadOnlyList<BindingDiagnostic> Validate(
        BindingExpression binding,
        BindingScope scope,
        string? targetElementId = null,
        IReadOnlyList<string>? resolvingElementIds = null)
    {
        var diagnostics = new List<BindingDiagnostic>();
        var kind = binding.Kind ?? BindingSourceKind.DataContext;

        if (kind == BindingSourceKind.QueryResult && string.IsNullOrEmpty(binding.Query))
        {
            diagnostics.Add(new("missingQuery", "Query result bindings must name the query they read from.", "query"));
        }

        if (kind == BindingSourceKind.ComponentProperty)
        {
            if (string.IsNullOrEmpty(binding.ComponentId))
            {
                diagnostics.Add(new("missingComponent", "Component property bindings must name the source component id.", "componentId"));
            }
            else if (scope.ComponentOutputs?.ContainsKey(binding.ComponentId) != true)
            {
                diagnostics.Add(new("unknownComponent", $"No component output scope exists for '{binding.ComponentId}'.", "componentId"));
            }

            if (!string.IsNullOrEmpty(binding.ComponentId) && targetElementId == binding.ComponentId)
            {
                diagnostics.Add(new("bindingCycle", $"Component '{binding.ComponentId}' cannot bind to its own output.", "componentId"));
            }

            if (!string.IsNullOrEmpty(binding.ComponentId) && resolvingElementIds?.Contains(binding.ComponentId) == true)
            {
                diagnostics.Add(new("bindingCycle", $"Binding to '{binding.ComponentId}' would create a component binding cycle.", "componentId"));
            }
        }

        if (binding.Mode == BindingMode.TwoWay && kind != BindingSourceKind.ComponentProperty)
        {
            diagnostics.Add(new("unsupportedTwoWayBinding", "Two-way bindings require a component output source.", "mode"));
        }

        if (binding.ExpectedValueType is not null && !MatchesExpectedType(BindingResolver.Resolve(binding, scope), binding.ExpectedValueType))
        {
            diagnostics.Add(new("bindingTypeMismatch", $"Binding value does not match expected {binding.ExpectedValueType}.", "expectedValueType"));
        }

        return diagnostics;
    }

    static bool MatchesExpectedType(BindingValue value, string type)
    {
        if (value.IsNullOrAbsent) return true;
        var kind = value.Node!.GetValueKind();
        return type switch
        {
            "string" or "enum" or "icon" or "destination" or "queryReference" => kind is JsonValueKind.String or JsonValueKind.Object,
            "number" => kind == JsonValueKind.Number,
            "boolean" => kind is JsonValueKind.True or JsonValueKind.False,
            "collection" => kind == JsonValueKind.Array,
            "object" => kind == JsonValueKind.Object,
            "json" => true,
            _ => false
        };
    }
}
