// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;

namespace Cratis.Scene.Screenplay;

/// <summary>
/// One thing the conversion of Screenplay into Scene's model reports - a construct it cannot say in Scene, with where it was declared.
/// </summary>
/// <param name="Code">The stable diagnostic code.</param>
/// <param name="Severity">How serious it is.</param>
/// <param name="Construct">The kind of Screenplay construct it is about.</param>
/// <param name="Path">The path of the construct in the application.</param>
/// <param name="Location">Where in the Screenplay source it was declared.</param>
/// <param name="Message">A one-line explanation.</param>
public sealed record ConversionDiagnostic(string Code, DiagnosticSeverity Severity, string Construct, string Path, SourceLocation Location, string Message)
{
    /// <summary>
    /// Gets the Screenplay <see cref="Diagnostic"/> this conversion diagnostic reports as.
    /// </summary>
    /// <returns>The <see cref="Diagnostic"/>.</returns>
    public Diagnostic ToDiagnostic() => new(Severity, Code, Message, Location);
}
