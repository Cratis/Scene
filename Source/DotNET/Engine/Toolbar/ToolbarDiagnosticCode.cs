// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// What is wrong with a toolbar button. The camel-cased names are shared with the TypeScript engine.
/// </summary>
public enum ToolbarDiagnosticCode
{
    /// <summary>A button invokes a slice the application structure does not have.</summary>
    ToolbarButtonSliceNotFound = 0,

    /// <summary>A button invokes a slice that is not a state change; state views and automations never take user input.</summary>
    ToolbarButtonSliceNotStateChange = 1,

    /// <summary>A button has no slice yet. It is allowed while designing, and flagged.</summary>
    ToolbarButtonSliceEmpty = 2,
}
