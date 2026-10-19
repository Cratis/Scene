// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// One application-level toolbar button a region effectively shows, with its provenance.
/// </summary>
/// <param name="Id">The button identity.</param>
/// <param name="Title">The text shown on the button.</param>
/// <param name="Emphasis">How prominent the button is; <see cref="ToolbarEmphasis.Secondary"/> when the button names none.</param>
/// <param name="Origin">Which level defined the button.</param>
/// <param name="ReadOnly">Whether the button may not be edited here: it is inherited from the application into a module.</param>
/// <param name="Reason">A sentence saying why the button is shown and whether it can be edited here.</param>
/// <param name="Icon">Qualified icon reference, when the button has one.</param>
/// <param name="Slice">The qualified id of the state change slice the button opens, when it names one.</param>
/// <param name="Authorize">The policy the user must satisfy to see the button, when it names one.</param>
public record EffectiveNavButton(
    string Id,
    string Title,
    ToolbarEmphasis Emphasis,
    NavigationItemOrigin Origin,
    bool ReadOnly,
    string Reason,
    string? Icon = null,
    string? Slice = null,
    string? Authorize = null);
