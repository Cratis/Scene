// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// What compiling the texts of a design gave.
/// </summary>
/// <param name="Document">The Scene document of the design; <see langword="null"/> when the texts do not compile.</param>
/// <param name="Diagnostics">What the compiler and the conversion to Scene report, by the screen that wrote it.</param>
internal sealed record BridgeDocument(SceneDocument? Document, IReadOnlyList<DesignDiagnostic> Diagnostics)
{
    /// <summary>
    /// Gets a value indicating whether the texts compiled without an error.
    /// </summary>
    public bool Succeeded => Document is not null && !Diagnostics.Any(diagnostic => diagnostic.Severity == "error");
}
