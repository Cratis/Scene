// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;

namespace Cratis.Scene.Screenplay;

/// <summary>
/// Collects the <see cref="ConversionDiagnostic"/>s a conversion reports.
/// </summary>
public sealed class ConversionDiagnostics
{
    readonly List<ConversionDiagnostic> _all = [];

    /// <summary>
    /// Gets everything reported so far.
    /// </summary>
    public IReadOnlyList<ConversionDiagnostic> All => _all.AsReadOnly();

    /// <summary>
    /// Gets a value indicating whether an error was reported.
    /// </summary>
    public bool HasErrors => _all.Exists(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error);

    /// <summary>
    /// Reports a diagnostic.
    /// </summary>
    /// <param name="diagnostic">The <see cref="ConversionDiagnostic"/> to report.</param>
    public void Report(ConversionDiagnostic diagnostic) => _all.Add(diagnostic);
}
