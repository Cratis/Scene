// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.LanguageModels;

namespace Cratis.Scene.Design.AI;

/// <summary>
/// The options of Scene Design with AI.
/// </summary>
public class DesignAIOptions
{
    /// <summary>
    /// The purpose a design turn talks as - the agent Cratis.AI resolves a provider for, and the purpose usage and causation are attributed to.
    /// </summary>
    public LanguageModelPurpose ScreenDesignPurpose { get; set; } = DesignPurposes.ScreenDesign;

    /// <summary>
    /// The purpose establishing and revising a design system talks as.
    /// </summary>
    public LanguageModelPurpose DesignSystemPurpose { get; set; } = DesignPurposes.DesignSystem;

    /// <summary>
    /// The most model requests - tool calls and their repairs included - a turn may make before it is given up. The turn then changes nothing.
    /// </summary>
    public int MaximumIterations { get; set; } = 24;

    /// <summary>
    /// The most writes a turn may have refused in a row, by the compiler or by the catalogue, before it is given up. The turn then changes nothing.
    /// </summary>
    public int MaximumFailedWrites { get; set; } = 6;
}
