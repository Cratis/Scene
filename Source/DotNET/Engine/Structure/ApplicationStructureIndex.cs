// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Structure;

/// <summary>
/// Answers the questions navigation, toolbar and template applicability ask of an <see cref="ApplicationStructure"/>:
/// does this module, feature or slice exist, which feature comes first in a module, and what kind of slice is it.
/// Pure and read-only; when ids are duplicated the first declaration wins and <see cref="Diagnostics"/> reports the rest.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">ApplicationStructureIndex</c> in <c language="csharp">engine/structure</c>) answers the same
/// questions the same way; both are asserted against <c language="csharp">application-structure-fixtures.json</c>.
/// </remarks>
public class ApplicationStructureIndex
{
    readonly Dictionary<string, ModuleNode> _modules = new(StringComparer.Ordinal);
    readonly Dictionary<string, FeatureNode> _features = new(StringComparer.Ordinal);
    readonly Dictionary<string, SliceNode> _slices = new(StringComparer.Ordinal);
    readonly Dictionary<string, List<string>> _featuresByName = new(StringComparer.Ordinal);
    readonly List<StructureDiagnostic> _diagnostics = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="ApplicationStructureIndex"/> class.
    /// </summary>
    /// <param name="structure">The application structure to index.</param>
    public ApplicationStructureIndex(ApplicationStructure structure)
    {
        Structure = structure;
        var seen = new Dictionary<string, string>(StringComparer.Ordinal);
        var names = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var module in structure.Modules)
        {
            var qualified = module.Id;
            if (!Claim(seen, qualified, "module"))
            {
                continue;
            }

            _modules[qualified] = module;
            ReportAmbiguousName(names, "module", module.Name, qualified);
            IndexContainer(qualified, module.Features, module.Slices ?? []);
        }
    }

    /// <summary>
    /// Gets the structure that was indexed.
    /// </summary>
    public ApplicationStructure Structure { get; }

    /// <summary>
    /// Gets the problems found while indexing, in declaration order.
    /// </summary>
    public IReadOnlyList<StructureDiagnostic> Diagnostics => _diagnostics;

    /// <summary>
    /// Finds a module by its id.
    /// </summary>
    /// <param name="moduleId">The module id, for example <c language="csharp">sales</c>.</param>
    /// <returns>The module, or <see langword="null"/> when there is none.</returns>
    public ModuleNode? FindModule(string moduleId) => _modules.GetValueOrDefault(moduleId);

    /// <summary>
    /// Finds a feature by its qualified id.
    /// </summary>
    /// <param name="qualifiedId">The dotted id from the module down, for example <c language="csharp">sales.orders</c> or <c language="csharp">sales.orders.returns</c>.</param>
    /// <returns>The feature, or <see langword="null"/> when there is none.</returns>
    public FeatureNode? FindFeature(string qualifiedId) => _features.GetValueOrDefault(qualifiedId);

    /// <summary>
    /// Gets the first feature of a module - the one a navigation target that names only the module goes to.
    /// </summary>
    /// <param name="moduleId">The module id.</param>
    /// <returns>The module's first top-level feature, or <see langword="null"/> when the module is unknown or has no features.</returns>
    public FeatureNode? FirstFeature(string moduleId) => FindModule(moduleId) is { Features.Count: > 0 } module ? module.Features[0] : null;

    /// <summary>
    /// Gets the qualified id of the first feature of a module.
    /// </summary>
    /// <param name="moduleId">The module id.</param>
    /// <returns>The qualified id, or <see langword="null"/> when the module is unknown or has no features.</returns>
    public string? FirstFeatureId(string moduleId) => FirstFeature(moduleId) is { } feature ? $"{moduleId}.{feature.Id}" : null;

    /// <summary>
    /// Finds a slice by its qualified id.
    /// </summary>
    /// <param name="qualifiedId">The dotted id from the module down, for example <c language="csharp">sales.orders.PlaceOrder</c>.</param>
    /// <returns>The slice, or <see langword="null"/> when there is none.</returns>
    public SliceNode? FindSlice(string qualifiedId) => _slices.GetValueOrDefault(qualifiedId);

    /// <summary>
    /// Gets what kind a slice is.
    /// </summary>
    /// <param name="sliceId">The slice's qualified id.</param>
    /// <returns>The kind, or <see langword="null"/> when there is no such slice.</returns>
    public SliceKind? KindOf(string sliceId) => FindSlice(sliceId)?.Kind;

    /// <summary>
    /// Finds every feature that has a given display name, in every module, so a caller can tell when a bare name is ambiguous.
    /// </summary>
    /// <param name="name">The display name, compared without regard to case.</param>
    /// <returns>The qualified ids of the features with that name, in declaration order.</returns>
    public IReadOnlyList<string> FindFeaturesByName(string name) =>
        _featuresByName.TryGetValue(name.ToLowerInvariant(), out var found) ? found : [];

    void IndexContainer(string path, IReadOnlyList<FeatureNode> features, IReadOnlyList<SliceNode> slices)
    {
        var seen = new Dictionary<string, string>(StringComparer.Ordinal);
        var featureNames = new Dictionary<string, string>(StringComparer.Ordinal);
        var sliceNames = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var feature in features)
        {
            var qualified = $"{path}.{feature.Id}";
            if (!Claim(seen, qualified, "feature"))
            {
                continue;
            }

            _features[qualified] = feature;
            var key = feature.Name.ToLowerInvariant();
            if (!_featuresByName.TryGetValue(key, out var byName))
            {
                _featuresByName[key] = byName = [];
            }

            byName.Add(qualified);
            ReportAmbiguousName(featureNames, "feature", feature.Name, qualified);
            IndexContainer(qualified, feature.Features, feature.Slices);
        }

        foreach (var slice in slices)
        {
            var qualified = $"{path}.{slice.Id}";
            if (!Claim(seen, qualified, "slice"))
            {
                continue;
            }

            _slices[qualified] = slice;
            ReportAmbiguousName(sliceNames, "slice", slice.Name, qualified);
        }
    }

    bool Claim(Dictionary<string, string> seen, string qualified, string kind)
    {
        if (seen.TryAdd(qualified, kind))
        {
            return true;
        }

        _diagnostics.Add(new(StructureDiagnosticCode.StructureDuplicateId, $"Id '{qualified}' is declared more than once; the first {seen[qualified]} wins.", qualified));
        return false;
    }

    void ReportAmbiguousName(Dictionary<string, string> names, string kind, string name, string qualified)
    {
        var key = name.ToLowerInvariant();
        if (names.TryGetValue(key, out var first))
        {
            _diagnostics.Add(new(StructureDiagnosticCode.StructureAmbiguousName, $"The {kind} name '{name}' is used by both '{first}' and '{qualified}'.", qualified));
            return;
        }

        names[key] = qualified;
    }
}
