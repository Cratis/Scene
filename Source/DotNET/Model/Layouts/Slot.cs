// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A named region of a <see cref="Layout"/> or screen template that content is placed in, positioned by its
/// <see cref="Arrangement"/>. A layout is not uniformly one arrangement mode — <c language="csharp">flow</c> for most
/// slots and <c language="csharp">freeform</c> for one is a valid combination.
/// </summary>
/// <remarks>
/// A slot is either filled by composition (a screen or a nested template fills it) or, when <see cref="Routed"/>, replaced
/// by whatever screen navigation places there. A routed slot is a destination: a destination names it by <see cref="Name"/>.
/// </remarks>
/// <param name="Name">The slot's name, unique within its layout, used by screens that fill it and destinations that navigate into it.</param>
/// <param name="Arrangement">How the slot is arranged, or <see langword="null"/> for the layout's default arrangement.</param>
public record Slot(string Name, Arrangement? Arrangement = null)
{
    /// <summary>
    /// Gets an optional description for designers.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets what kind of region the slot is. <see langword="null"/> derives it: a primary slot is a <see cref="SlotRole.Page"/>,
    /// any other slot a <see cref="SlotRole.Pane"/>. Use <c language="csharp">SlotRoles.Resolve</c> rather than reading this directly.
    /// </summary>
    public SlotRole? Role { get; init; }

    /// <summary>
    /// Gets a value indicating whether navigation replaces the slot's content, making it a destination.
    /// </summary>
    public bool? Routed { get; init; }

    /// <summary>
    /// Gets the route parameters the routed slot is addressed by - Screenplay's <c language="screenplay">routed by &lt;param&gt;</c>.
    /// Only meaningful on a routed slot.
    /// </summary>
    public IReadOnlyList<string>? RoutedBy { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is the slot every screen's content is placed in when nothing names another. At most one per owner.
    /// </summary>
    public bool? Primary { get; init; }

    /// <summary>
    /// Gets a value indicating whether the slot may stay empty; an optional slot with no content takes no space.
    /// </summary>
    public bool? Optional { get; init; }

    /// <summary>
    /// Gets the semantic template types a screen must have to be placed in this slot, such as <c language="csharp">Detail</c>
    /// or <c language="csharp">Form</c>. <see langword="null"/> accepts any screen.
    /// </summary>
    public IReadOnlyList<string>? Accepts { get; init; }
}
