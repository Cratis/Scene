// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// How serious a toolbar diagnostic is.
/// </summary>
public enum ToolbarDiagnosticSeverity
{
    /// <summary>The button cannot work.</summary>
    Error = 0,

    /// <summary>The button is allowed but incomplete.</summary>
    Warning = 1,
}
