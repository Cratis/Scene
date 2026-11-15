// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// What a design may propose to the design system: the things its draft holds that the canvas does not edit.
/// </summary>
public static class DesignSystemProposalKinds
{
    /// <summary>
    /// A token role, such as <c language="text">tokens.color.accent</c>.
    /// </summary>
    public const string Token = "token";

    /// <summary>
    /// A variant of a component of the design system.
    /// </summary>
    public const string Variant = "variant";

    /// <summary>
    /// A word: how the product speaks or what it calls things.
    /// </summary>
    public const string Word = "word";

    /// <summary>
    /// A screen template.
    /// </summary>
    public const string Template = "template";

    /// <summary>
    /// A component of the design system.
    /// </summary>
    public const string Component = "component";

    /// <summary>
    /// Gets every kind.
    /// </summary>
    public static readonly IReadOnlyList<string> All = [Token, Variant, Word, Template, Component];
}
