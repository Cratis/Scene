// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Builds the findings editing and resolving report.
/// </summary>
static class Finding
{
    /// <summary>
    /// Builds an error: the edit or resolution step that produced it did not happen.
    /// </summary>
    /// <param name="code">The reason.</param>
    /// <param name="message">What happened.</param>
    /// <param name="nodeId">The node it is about.</param>
    /// <param name="instance">The instance it is about.</param>
    /// <param name="component">The id of the component it is about.</param>
    /// <param name="path">The property path it is about.</param>
    /// <param name="itemId">The collection item it is about.</param>
    /// <returns>The diagnostic.</returns>
    public static SceneDiagnostic Error(DiagnosticCode code, string message, string? nodeId = null, string? instance = null, string? component = null, string? path = null, string? itemId = null) =>
        new(code, DiagnosticSeverity.Error, message, nodeId, instance, component, path, itemId);

    /// <summary>
    /// Builds a warning: the work went ahead, and the author should know something about it.
    /// </summary>
    /// <param name="code">The reason.</param>
    /// <param name="message">What happened.</param>
    /// <param name="nodeId">The node it is about.</param>
    /// <param name="instance">The instance it is about.</param>
    /// <param name="component">The id of the component it is about.</param>
    /// <param name="path">The property path it is about.</param>
    /// <param name="itemId">The collection item it is about.</param>
    /// <returns>The diagnostic.</returns>
    public static SceneDiagnostic Warning(DiagnosticCode code, string message, string? nodeId = null, string? instance = null, string? component = null, string? path = null, string? itemId = null) =>
        new(code, DiagnosticSeverity.Warning, message, nodeId, instance, component, path, itemId);

    /// <summary>
    /// Gets whether any diagnostic is an error.
    /// </summary>
    /// <param name="diagnostics">The diagnostics.</param>
    /// <returns><see langword="true"/> when one is an error.</returns>
    public static bool HasErrors(IEnumerable<SceneDiagnostic> diagnostics) => diagnostics.Any(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error);

    /// <summary>
    /// Gives a diagnostic more context where it has none.
    /// </summary>
    /// <param name="diagnostic">The diagnostic.</param>
    /// <param name="context">The context to add.</param>
    /// <returns>The diagnostic with the context.</returns>
    public static SceneDiagnostic With(SceneDiagnostic diagnostic, DiagnosticContext context) => diagnostic with
    {
        NodeId = context.NodeId ?? diagnostic.NodeId,
        Instance = context.Instance ?? diagnostic.Instance,
        Component = context.Component ?? diagnostic.Component,
    };
}
