// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// How serious a finding is.
/// </summary>
public enum DiagnosticSeverity
{
    /// <summary>
    /// The edit or resolution step did not happen.
    /// </summary>
    Error = 0,

    /// <summary>
    /// The work went ahead, and the author should know something about it.
    /// </summary>
    Warning = 1,
}
