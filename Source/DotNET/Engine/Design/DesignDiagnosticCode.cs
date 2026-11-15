// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// What can be wrong with the way a design system is selected and resolved. Serialized in camelCase.
/// </summary>
public enum DesignDiagnosticCode
{
    /// <summary>
    /// The profile names a theme the design system and the packages do not have; the default theme is used.
    /// </summary>
    ThemeNotFound = 0,

    /// <summary>
    /// The theme has no values for the mode the profile asks for; the theme is drawn without them.
    /// </summary>
    ModeNotImplemented = 1,

    /// <summary>
    /// The profile asks for a colour scheme the design system does not declare as a mode; its first mode is used.
    /// </summary>
    ModeNotDeclared = 2,

    /// <summary>
    /// A component part refers to a token role the theme gives no value in the mode; the part is left out.
    /// </summary>
    TokenUnresolved = 3
}
