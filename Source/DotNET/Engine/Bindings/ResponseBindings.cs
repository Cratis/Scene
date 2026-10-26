// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>Validates command-response bindings in lexical continuation scopes.</summary>
public static partial class ResponseBindings
{
    /// <summary>Validates every branch, including branches not reachable at runtime.</summary>
    /// <param name="entry">The action-list or form-success entry point.</param>
    /// <param name="contracts">The producer's source and destination metadata.</param>
    /// <returns>Diagnostics for unavailable or incompatible response operands.</returns>
    public static IReadOnlyList<BindingDiagnostic> Validate(ResponseValidationEntry entry, IResponseValidationContracts contracts)
    {
        var diagnostics = new List<BindingDiagnostic>();
        var actions = entry.Kind == "form" ? entry.OnSubmit ?? [] : entry.Actions ?? [];
        var response = entry.Command is null ? null : contracts.CommandResponse(entry.Command);
        Visit(actions, entry.Kind == "form" ? response : null, contracts, diagnostics);
        return diagnostics;
    }

    /// <summary>Projects a scalar, object or whole array member through own object properties.</summary>
    /// <param name="type">The command's response value type.</param>
    /// <param name="path">The dotted member path; empty selects a scalar or object response.</param>
    /// <returns>The projected type, or null for an unsupported path.</returns>
    public static ResponseValueType? ProjectType(ResponseValueType type, string path)
    {
        if (path.Length == 0) return type.Kind == "array" ? null : type;
        var selected = type;
        foreach (var segment in path.Split('.'))
        {
            var property = MemberType(selected, segment);
            if (property is null) return null;
            selected = property with { Nullable = selected.Nullable || property.Nullable };
        }
        return selected;
    }

    /// <summary>Checks recursive structural compatibility without coercion.</summary>
    /// <param name="source">The projected response type.</param>
    /// <param name="target">The actual destination type.</param>
    /// <returns>Whether the destination accepts every value of the source type.</returns>
    public static bool IsAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (source.Nullable && !target.Nullable) return false;
        if (source.Kind != target.Kind) return false;
        return source.Kind switch
        {
            "object" => ObjectAssignable(source, target),
            "array" => ArrayAssignable(source, target),
            _ => IsPrimitive(source.Kind)
        };
    }

    static bool IsPrimitive(string kind) => kind == "string" || kind == "number" || kind == "boolean";

    static bool ObjectAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (target.Properties is null || source.Properties is null) return false;
        return target.Properties.All(property => source.Properties.TryGetValue(property.Key, out var value) && IsAssignable(value, property.Value));
    }

    static bool ArrayAssignable(ResponseValueType source, ResponseValueType target)
    {
        if (source.Item is null || target.Item is null) return false;
        return IsAssignable(source.Item, target.Item);
    }

    static ResponseValueType? MemberType(ResponseValueType type, string segment)
    {
        if (type.Kind != "object" || type.Properties is null) return null;
        if (!MemberName().IsMatch(segment)) return null;
        if (segment == "constructor" || segment == "prototype" || segment == "__proto__") return null;
        return type.Properties.TryGetValue(segment, out var property) ? property : null;
    }

    static void Visit(IReadOnlyList<InteractionAction> actions, ResponseContract? response, IResponseValidationContracts contracts, List<BindingDiagnostic> diagnostics)
    {
        foreach (var action in actions)
        {
            ValidateAction(action, response, contracts, diagnostics);
            Visit(action.OnSuccess ?? [], SuccessResponse(action, response, contracts), contracts, diagnostics);
            Visit(action.OnFailure ?? [], action is ExecuteCommandAction ? null : response, contracts, diagnostics);
            Visit(action.OnResult ?? [], response, contracts, diagnostics);
        }
    }

    static ResponseContract? SuccessResponse(InteractionAction action, ResponseContract? enclosing, IResponseValidationContracts contracts) => action is ExecuteCommandAction command ? contracts.CommandResponse(command.Command) : enclosing;

    static void ValidateAction(InteractionAction action, ResponseContract? response, IResponseValidationContracts contracts, List<BindingDiagnostic> diagnostics)
    {
        foreach (var (binding, operand) in Operands(action).Where(value => value.Binding.Kind == BindingSourceKind.CommandResponse))
        {
            if (!CompatibleOperand(binding, response, contracts.TargetType(action, operand))) diagnostics.Add(new("invalidResponseBinding", "Command response binding requires an available, compatible source and destination.", binding.Path));
        }
    }

    static bool CompatibleOperand(BindingExpression binding, ResponseContract? response, ResponseValueType? target)
    {
        if (binding.Mode == BindingMode.TwoWay) return false;
        if (response?.Kind != "value" || response.Type is null) return false;
        if (target is null) return false;
        var source = ProjectType(response.Type, binding.Path);
        if (source is null) return false;
        return IsAssignable(source, target) && ExpectedCategory(source, binding.ExpectedValueType);
    }

    static IEnumerable<(BindingExpression Binding, ResponseOperand Operand)> Operands(InteractionAction action)
    {
        foreach (var argument in action.Arguments ?? []) yield return (argument.Value, new("argument", argument.Name));
        if (action is SetStateAction state) yield return (state.Value, new("stateValue"));
        var binding = MessageBinding(action);
        if (binding is not null) yield return (binding, new("message"));
    }

    static BindingExpression? MessageBinding(InteractionAction action) => action switch
    {
        NotifyAction notify => notify.Message.Binding,
        ConfirmAction confirm => confirm.Message.Binding,
        _ => null
    };

    static bool ExpectedCategory(ResponseValueType type, string? expected) => expected switch
    {
        null or "json" => true,
        "collection" => type.Kind == "array",
        "string" or "enum" or "icon" or "destination" or "queryReference" => type.Kind == "string" || type.Kind == "object",
        _ => type.Kind == expected
    };

    [GeneratedRegex("^[A-Za-z_][A-Za-z0-9_]*$", RegexOptions.CultureInvariant, 1000)]
    private static partial Regex MemberName();
}
