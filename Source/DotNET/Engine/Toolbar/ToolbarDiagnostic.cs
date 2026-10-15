// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// One problem with a toolbar button.
/// </summary>
/// <param name="Code">What kind of problem this is.</param>
/// <param name="Severity">Whether the button cannot work or is only incomplete.</param>
/// <param name="Message">A sentence naming the button and the slice.</param>
/// <param name="Button">The id of the button the problem was found on.</param>
public record ToolbarDiagnostic(ToolbarDiagnosticCode Code, ToolbarDiagnosticSeverity Severity, string Message, string Button);
