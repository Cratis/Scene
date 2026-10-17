// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The result of an edit: the profile after it (the same profile when nothing changed) and what happened.
/// </summary>
/// <param name="Profile">The profile after the edit.</param>
/// <param name="Outcome">What happened.</param>
/// <param name="Added">The packages the edit added, dependencies first.</param>
/// <param name="Removed">The packages the edit removed.</param>
/// <param name="Message">A sentence with real names, ready for a status line. Empty when there is nothing to say.</param>
public record PackageEdit(
    UiProfile Profile,
    PackageEditOutcome Outcome,
    IReadOnlyList<string> Added,
    IReadOnlyList<string> Removed,
    string Message);
