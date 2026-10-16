// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Whose template the shell is.
/// </summary>
public enum ShellSource
{
    /// <summary>
    /// A template of this application.
    /// </summary>
    Own = 0,

    /// <summary>
    /// A template of an installed blueprint.
    /// </summary>
    Blueprint = 1,

    /// <summary>
    /// The engine's built-in bare shell.
    /// </summary>
    BuiltIn = 2
}
