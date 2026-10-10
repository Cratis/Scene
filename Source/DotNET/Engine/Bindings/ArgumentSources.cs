// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Bindings;

/// <summary>
/// Resolves where a command argument comes from, as an action's argument mapping writes it, with the same semantics as
/// the TypeScript <c language="csharp">resolveArgumentSource</c>; both run <c language="csharp">argument-source-fixtures.json</c>.
/// </summary>
public static class ArgumentSources
{
    /// <summary>
    /// The prefix of an argument source that reads another element's output.
    /// </summary>
    public const string ComponentPrefix = "component.";

    /// <summary>
    /// Resolves an argument source. <c language="csharp">component.&lt;id&gt;.&lt;output&gt;</c> reads an output another
    /// element publishes, choosing the longest element id with outputs in scope since ids may contain dots; any other
    /// source is a path in the data context.
    /// </summary>
    /// <param name="source">The argument source.</param>
    /// <param name="scope">The values available.</param>
    /// <returns>The resolved value.</returns>
    public static BindingValue Resolve(string? source, BindingScope scope)
    {
        if (string.IsNullOrEmpty(source)) return BindingValue.Absent;
        if (!source.StartsWith(ComponentPrefix, StringComparison.Ordinal)) return BindingResolver.Resolve(new BindingExpression(source), scope);

        var reference = source[ComponentPrefix.Length..];
        var componentId = (scope.ComponentOutputs?.Keys ?? [])
            .Where(id => reference == id || reference.StartsWith($"{id}.", StringComparison.Ordinal))
            .OrderByDescending(id => id.Length)
            .FirstOrDefault();
        if (componentId is null) return BindingValue.Absent;

        var path = reference.Length > componentId.Length ? reference[(componentId.Length + 1)..] : string.Empty;
        return BindingResolver.Resolve(new BindingExpression(path, BindingSourceKind.ComponentProperty, ComponentId: componentId), scope);
    }
}
