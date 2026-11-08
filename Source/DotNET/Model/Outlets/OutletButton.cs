// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;
using Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// A button of an outlet of actions: Screenplay's <c language="screenplay">button &lt;id&gt; title "…"</c>. A button with a slice is a hook.
/// </summary>
public record OutletButton : OutletAction
{
    /// <inheritdoc/>
    [JsonIgnore]
    public override OutletItemKind Kind => OutletItemKind.Button;

    /// <summary>Gets how prominent the button is; secondary when absent.</summary>
    public ToolbarEmphasis? Emphasis { get; init; }

    /// <summary>Gets what the button shows - its icon, its title or both; both when absent. The title stays the accessible name.</summary>
    public OutletButtonDisplay? Display { get; init; }
}
