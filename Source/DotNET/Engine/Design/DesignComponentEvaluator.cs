// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// Resolves the anatomy of a design system's components against token values. The TypeScript twin is <c language="csharp">evaluateDesignComponents</c>.
/// </summary>
public static class DesignComponentEvaluator
{
    /// <summary>
    /// Resolves every part of every variant, and of every state (the state's own parts merged over the variant's), to the value of the token role it names.
    /// A part whose role has no value is left out and, unless <paramref name="reportMissing"/> is off, reported; the result never carries a guessed value.
    /// </summary>
    /// <param name="components">The components, as a design system declares them.</param>
    /// <param name="tokens">The value of each token role, keyed by <c language="csharp">&lt;category&gt;.&lt;name&gt;</c>.</param>
    /// <param name="reportMissing">Whether a part whose role has no value is a problem. A theme a package ships covers only the roles it knows, so the host passes <see langword="false"/> for it and the package's own fallback applies.</param>
    /// <returns>The resolved components and what could not be resolved.</returns>
    public static EvaluatedDesignComponents Evaluate(IReadOnlyList<DesignComponent> components, IReadOnlyDictionary<string, string> tokens, bool reportMissing = true)
    {
        var problems = new List<string>();

        void Resolve(string component, string variant, string? state, string part, string role, Dictionary<string, string> into)
        {
            if (tokens.TryGetValue(role, out var value))
            {
                into[part] = value;
                return;
            }

            if (reportMissing)
            {
                problems.Add($"{component}.{variant}{(state is null ? string.Empty : $".{state}")}: part '{part}' refers to '{role}', which has no value.");
            }
        }

        var resolved = components.Select(component => new ResolvedDesignComponent(
            component.Name,
            [.. component.Variants.Select(variant =>
            {
                var parts = new Dictionary<string, string>(StringComparer.Ordinal);
                foreach (var (part, role) in variant.Parts)
                {
                    Resolve(component.Name, variant.Name, null, part, role, parts);
                }

                var states = new Dictionary<string, IReadOnlyDictionary<string, string>>(StringComparer.Ordinal);
                foreach (var (state, overrides) in variant.States ?? new Dictionary<string, IReadOnlyDictionary<string, string>>())
                {
                    var merged = new Dictionary<string, string>(parts, StringComparer.Ordinal);
                    foreach (var (part, role) in overrides)
                    {
                        Resolve(component.Name, variant.Name, state, part, role, merged);
                    }

                    states[state] = merged;
                }

                return new ResolvedDesignVariant(variant.Name, parts, states.Count == 0 ? null : states);
            })])).ToList();

        return new(resolved, problems);
    }
}
