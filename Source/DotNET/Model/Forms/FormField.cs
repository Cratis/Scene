// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// One field of a <see cref="Form"/>. Mirrors the three population tiers Screenplay's <c>form</c> construct
/// establishes: auto-mapped by name (<see cref="SourceProperty"/> and <see cref="ComposeUsing"/> both
/// <see langword="null"/>), explicitly renamed (<see cref="SourceProperty"/> set), or computed by a callback
/// (<see cref="ComposeUsing"/> set).
/// </summary>
/// <param name="Name">The field's name on the command being built.</param>
/// <param name="SourceProperty">The source property to map from, when it differs from <paramref name="Name"/>.</param>
/// <param name="ComposeUsing">The resolved name of a callback that computes this field's value.</param>
/// <param name="Label">The field's label — plain text, or the literal <c>$strings.&lt;key&gt;</c> reference.</param>
public record FormField(string Name, string? SourceProperty = null, string? ComposeUsing = null, string? Label = null);
