// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// What the engine needs to say about an editing scope.
/// </summary>
static class EditingScopeExtensions
{
    /// <summary>
    /// The id the scope contributes under: screen:name, template:name, dialog:name or layout:name.
    /// </summary>
    /// <summary>
    /// Gets the id the scope contributes under.
    /// </summary>
    /// <param name="scope">The scope.</param>
    /// <returns>The id, such as <c language="csharp">screen:name</c>.</returns>
    public static string Instance(this EditingScope scope) => $"{Prefix(scope.Kind)}:{scope.Name}";

    /// <summary>
    /// Describes the scope in a sentence.
    /// </summary>
    /// <param name="scope">The scope.</param>
    /// <returns>A description, such as <c language="csharp">the screen 'name'</c>.</returns>
    public static string Describe(this EditingScope scope) => scope.Kind switch
    {
        EditingScopeKind.Screen => $"the screen '{scope.Name}'",
        EditingScopeKind.ScreenTemplate => $"the screen template '{scope.Name}'",
        EditingScopeKind.DialogTemplate => $"the dialog template '{scope.Name}'",
        _ => $"the layout '{scope.Name}'"
    };

    static string Prefix(EditingScopeKind kind) => kind switch
    {
        EditingScopeKind.Screen => "screen",
        EditingScopeKind.ScreenTemplate => "template",
        EditingScopeKind.DialogTemplate => "dialog",
        _ => "layout"
    };
}
