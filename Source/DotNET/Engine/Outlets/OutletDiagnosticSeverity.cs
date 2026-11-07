// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// How serious an <see cref="OutletDiagnostic"/> is.
/// </summary>
public enum OutletDiagnosticSeverity
{
    /// <summary>The outlet cannot resolve as written; an item is left out or a reference names nothing.</summary>
    Error = 0,

    /// <summary>The outlet resolves, but something written has no effect or lands somewhere other than asked.</summary>
    Warning = 1,
}
