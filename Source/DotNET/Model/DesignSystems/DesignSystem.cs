// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A resolved design system: the contract an application is drawn from, with every theme's values already followed through
/// palettes and references. It is platform-neutral on purpose - a token has a value, a component has parts, and nothing says
/// what a part becomes in CSS or in a native style; a renderer decides that.
/// </summary>
/// <remarks>
/// The components are the contract between a design system and the component packages: a package component reads its look
/// from the anatomy a design system declares (its <c language="csharp">primary</c> variant's <c language="csharp">background</c> in
/// <c language="csharp">hover</c>), never from a token name. Products name tokens freely.
/// </remarks>
/// <param name="Name">The design system's name.</param>
/// <param name="Modes">The modes it is drawn in (for example <c language="csharp">light</c> and <c language="csharp">dark</c>). Every theme implements every mode.</param>
/// <param name="Tokens">The token roles: what each design token is for.</param>
/// <param name="Components">The components, each with the parts, variants and states it is made of.</param>
/// <param name="Themes">The themes that implement it, one flagged as the default.</param>
/// <param name="Words">The words the product speaks with, or <see langword="null"/> when the design system declares none.</param>
/// <param name="ContrastRules">The contrast every theme must satisfy, or <see langword="null"/> for none.</param>
/// <param name="ContrastFindings">The contrast measured for every theme, mode, component, variant and state a rule applies to, or <see langword="null"/> when nothing was measured.</param>
/// <param name="Appearance">Which token roles a profile's accent, corners and font replace, or <see langword="null"/> when a profile cannot restyle the design system.</param>
public record DesignSystem(
    string Name,
    IReadOnlyList<string> Modes,
    IReadOnlyList<TokenRole> Tokens,
    IReadOnlyList<DesignComponent> Components,
    IReadOnlyList<DesignTheme> Themes,
    DesignWords? Words = null,
    IReadOnlyList<ContrastRule>? ContrastRules = null,
    IReadOnlyList<ContrastFinding>? ContrastFindings = null,
    AppearanceBindings? Appearance = null);
