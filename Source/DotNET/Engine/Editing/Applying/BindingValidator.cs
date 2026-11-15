// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Queries;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Checks a query binding against the query a host offers: the shape of its result, its arguments and the fields it binds to.
/// </summary>
static class BindingValidator
{
    static readonly HashSet<string> _integerTypes = ["int", "integer", "int16", "int32", "int64", "short", "long", "byte", "uint", "uint16", "uint32", "uint64"];
    static readonly HashSet<string> _fractionalTypes = ["number", "float", "double", "decimal", "single"];
    static readonly HashSet<string> _anyTypes = ["any", "unknown"];

    /// <summary>
    /// Gets whether a value of one type can supply a parameter of another.
    /// </summary>
    /// <param name="sourceType">The type of the source.</param>
    /// <param name="targetType">The type of the parameter.</param>
    /// <returns><see langword="true"/> when they are compatible; integers widen to fractions, and unknown types fit anything.</returns>
    public static bool AreTypesCompatible(string sourceType, string targetType)
    {
        var source = NormalizeType(sourceType);
        var target = NormalizeType(targetType);
        if (source == target || _anyTypes.Contains(source) || _anyTypes.Contains(target))
        {
            return true;
        }

        if (_integerTypes.Contains(source))
        {
            return _integerTypes.Contains(target) || _fractionalTypes.Contains(target);
        }

        return _fractionalTypes.Contains(source) && _fractionalTypes.Contains(target);
    }

    /// <summary>
    /// Checks a binding to a query.
    /// </summary>
    /// <param name="descriptor">The descriptor of the property being bound.</param>
    /// <param name="candidate">The query the binding names, as the host offers it; <see langword="null"/> when it does not.</param>
    /// <param name="binding">The binding.</param>
    /// <param name="scopeTypes">The types of what is available to supply an argument, by path; when omitted the sources are not checked.</param>
    /// <returns>What is wrong with it.</returns>
    public static List<SceneDiagnostic> Validate(PropertyDescriptor descriptor, QueryCandidate? candidate, QueryBindingValue binding, IReadOnlyDictionary<string, string>? scopeTypes = null)
    {
        var path = descriptor.Path;
        if (candidate is null)
        {
            return [Missing(binding, path)];
        }

        if (candidate.Id != binding.QueryId)
        {
            return [Missing(binding, path)];
        }

        var diagnostics = new List<SceneDiagnostic>();
        var allowedShapes = descriptor.Constraints?.ResultShapes;
        if (allowedShapes?.Contains(candidate.ResultShape) == false)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.IncompatibleResultShape,
                $"'{descriptor.Label}' binds to {string.Join(" or ", allowedShapes.Select(LayoutTypeNames.Of))} results, but '{candidate.Name}' returns {LayoutTypeNames.Of(candidate.ResultShape)}.",
                path: path));
        }

        foreach (var argument in binding.Arguments)
        {
            var parameter = candidate.Parameters.FirstOrDefault(candidateParameter => candidateParameter.Name == argument.Parameter);
            if (parameter is null)
            {
                diagnostics.Add(Finding.Error(DiagnosticCode.UnknownParameter, $"'{candidate.Name}' has no parameter '{argument.Parameter}'.", path: path));
                continue;
            }

            if (scopeTypes is null)
            {
                continue;
            }

            if (!scopeTypes.TryGetValue(argument.SourcePath, out var sourceType))
            {
                diagnostics.Add(Finding.Error(DiagnosticCode.UnresolvedArgumentSource, $"'{argument.SourcePath}' is not available to supply '{parameter.Name}'.", path: path));
            }
            else if (!AreTypesCompatible(sourceType, parameter.Type))
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ArgumentTypeMismatch,
                    $"'{argument.SourcePath}' is {sourceType} but '{parameter.Name}' expects {parameter.Type}.",
                    path: path));
            }
        }

        foreach (var parameter in candidate.Parameters.Where(candidateParameter => candidateParameter.Required))
        {
            if (!binding.Arguments.Any(argument => argument.Parameter == parameter.Name))
            {
                diagnostics.Add(Finding.Error(DiagnosticCode.MissingRequiredParameter, $"'{candidate.Name}' needs a value for '{parameter.Name}'.", path: path));
            }
        }

        foreach (var result in binding.Results)
        {
            if (!candidate.ResultFields.Any(field => field.Name == result.Field))
            {
                diagnostics.Add(Finding.Error(DiagnosticCode.UnknownResultField, $"'{candidate.Name}' does not return a field '{result.Field}'.", path: path));
            }
        }

        return diagnostics;
    }

    static SceneDiagnostic Missing(QueryBindingValue binding, string path) =>
        Finding.Error(DiagnosticCode.MissingQuery, $"The query '{binding.Query}' ({binding.QueryId}) is not available here.", path: path);

    static string NormalizeType(string type)
    {
        var normalized = type.Trim().ToLowerInvariant();
        return normalized.EndsWith('?') ? normalized[..^1] : normalized;
    }
}
