// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>Validates command-response bindings in lexical continuation scopes.</summary>
public static partial class ResponseBindings
{
    static IReadOnlyDictionary<string, string[]> ExpectedCategories { get; } = new Dictionary<string, string[]>(StringComparer.Ordinal)
    {
        ["json"] = ["string", "number", "boolean", "object", "array"],
        ["collection"] = ["array"],
        ["object"] = ["object"],
        ["string"] = ["string", "object"],
        ["enum"] = ["string", "object"],
        ["icon"] = ["string", "object"],
        ["destination"] = ["string", "object"],
        ["queryReference"] = ["string", "object"],
        ["number"] = ["number"],
        ["boolean"] = ["boolean"]
    };

    /// <summary>Validates every branch, including branches not reachable at runtime.</summary>
    /// <param name="entry">The action-list or form-success entry point.</param>
    /// <param name="contracts">The producer's source and destination metadata.</param>
    /// <returns>Diagnostics for unavailable or incompatible response operands.</returns>
    public static IReadOnlyList<BindingDiagnostic> Validate(ResponseValidationEntry entry, IResponseValidationContracts contracts)
    {
        var diagnostics = new List<BindingDiagnostic>();
        var actions = entry.Kind == "form" ? entry.OnSubmit : entry.Actions;
        Visit(Continuation(actions), EntryResponse(entry, contracts), contracts, diagnostics);
        return diagnostics;
    }

    static ResponseContract? EntryResponse(ResponseValidationEntry entry, IResponseValidationContracts contracts)
    {
        if (entry.Kind != "form" || entry.Command is null) return null;
        return contracts.CommandResponse(entry.Command);
    }

    static void Visit(IReadOnlyList<InteractionAction> actions, ResponseContract? response, IResponseValidationContracts contracts, List<BindingDiagnostic> diagnostics)
    {
        foreach (var action in actions)
        {
            ValidateAction(action, response, contracts, diagnostics);
            Visit(Continuation(action.OnSuccess), SuccessResponse(action, response, contracts), contracts, diagnostics);
            Visit(Continuation(action.OnFailure), FailureResponse(action, response), contracts, diagnostics);
            Visit(Continuation(action.OnResult), response, contracts, diagnostics);
        }
    }

    static IReadOnlyList<InteractionAction> Continuation(IReadOnlyList<InteractionAction>? actions) => actions ?? [];
    static ResponseContract? SuccessResponse(InteractionAction action, ResponseContract? enclosing, IResponseValidationContracts contracts) => action is ExecuteCommandAction command ? contracts.CommandResponse(command.Command) : enclosing;
    static ResponseContract? FailureResponse(InteractionAction action, ResponseContract? enclosing) => action is ExecuteCommandAction ? null : enclosing;
    static ResponseValueType? ResponseType(ResponseContract? response) => response?.Kind == "value" ? response.Type : null;

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
        var type = ResponseType(response);
        if (type is null || target is null) return false;
        return CompatibleProjection(binding, type, target);
    }

    static bool CompatibleProjection(BindingExpression binding, ResponseValueType type, ResponseValueType target)
    {
        var source = ProjectType(type, binding.Path);
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

    static bool ExpectedCategory(ResponseValueType type, string? expected)
    {
        if (expected is null) return true;
        return ExpectedCategories.GetValueOrDefault(expected)?.Contains(type.Kind, StringComparer.Ordinal) ?? false;
    }
}
