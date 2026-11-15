// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.LanguageModels;

namespace Cratis.Scene.Design.AI;

/// <summary>
/// The purposes Scene Design talks to a model for. A host maps each to an agent in Cratis.AI, or configures a purpose of its own in <see cref="DesignAIOptions"/>.
/// </summary>
public static class DesignPurposes
{
    /// <summary>
    /// Designing screens and screen templates: a design turn.
    /// </summary>
    public static readonly LanguageModelPurpose ScreenDesign = new("ScreenDesign");

    /// <summary>
    /// Establishing or revising a design system from the sources a host supplies.
    /// </summary>
    public static readonly LanguageModelPurpose DesignSystem = new("DesignSystem");
}
