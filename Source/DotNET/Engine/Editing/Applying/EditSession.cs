// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Everything an edit needs to decide whether it is allowed, worked out once against the document as it was.
/// </summary>
sealed class EditSession
{
    static readonly Dictionary<string, ExposureGrant> _noGrants = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="EditSession"/> class.
    /// </summary>
    /// <param name="document">The document as it was.</param>
    /// <param name="root">The document as data. It is only read.</param>
    /// <param name="context">What editing needs besides the document.</param>
    public EditSession(SceneDocument document, JsonObject root, EditingContext context)
    {
        Document = document;
        Context = context;
        Index = DocumentIndexer.Index(root);
        Chain = TemplateChainResolver.Resolve(document, root, context.Scope);
        Grants = ExposureGrants.Compute(Chain, context.Catalog);
        Configuration = EffectiveConfigurationResolver.Resolve(Chain, document.InstanceContributions, context.Catalog);
    }

    /// <summary>
    /// Gets the document as it was.
    /// </summary>
    public SceneDocument Document { get; }

    /// <summary>
    /// Gets what editing needs besides the document.
    /// </summary>
    public EditingContext Context { get; }

    /// <summary>
    /// Gets the index of the document's nodes.
    /// </summary>
    public DocumentIndex Index { get; }

    /// <summary>
    /// Gets the chain of owners the scope sits inside.
    /// </summary>
    public TemplateChain Chain { get; }

    /// <summary>
    /// Gets what each instance in the chain may configure.
    /// </summary>
    public ExposureGrants Grants { get; }

    /// <summary>
    /// Gets the effective configuration of the chain.
    /// </summary>
    public EffectiveConfiguration Configuration { get; }

    /// <summary>
    /// Gets the instance id the scope contributes as, or <see langword="null"/> when the scope was not found.
    /// </summary>
    public string? ScopeInstance => Chain.Levels.Count == 0 ? null : Chain.Levels[^1].Instance;

    /// <summary>
    /// Gets what the scope's instance may configure on inherited components.
    /// </summary>
    public IReadOnlyDictionary<string, ExposureGrant> ScopeGrants => ScopeInstance is not null && Grants.ByInstance.TryGetValue(ScopeInstance, out var grants) ? grants : _noGrants;

    /// <summary>
    /// Gets where an inherited node comes from, for a message.
    /// </summary>
    /// <param name="record">The node.</param>
    /// <returns>The owner.</returns>
    public static string SourceOf(NodeRecord record) => record.Owner;

    /// <summary>
    /// Gets whether the scope itself owns a node.
    /// </summary>
    /// <param name="record">The node.</param>
    /// <returns><see langword="true"/> when the node is the scope's own.</returns>
    public bool IsLocal(NodeRecord record) =>
        Chain.Levels.Count > 0 && record.Owner == Chain.Levels[^1].Owner && record.OwnerKind == Chain.Levels[^1].Kind;
}
