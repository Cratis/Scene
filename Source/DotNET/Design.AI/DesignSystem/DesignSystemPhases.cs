// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;
using Cratis.Scene.Design.AI.Prompts;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// The steps of establishing a design system, in the order a person would take them.
/// </summary>
/// <remarks>
/// Ported from Direct's Muse phases. Establishing runs the steps in one tool loop, so the model keeps what it learned from the sources; a host that
/// wants a step at a time asks for one.
/// </remarks>
public static partial class DesignSystemPhases
{
    /// <summary>
    /// Looking at the captures of the running application.
    /// </summary>
    public const string RunningApp = "running-app";

    /// <summary>
    /// The colors, light and dark.
    /// </summary>
    public const string Colors = "colors";

    /// <summary>
    /// Type, spacing, radius and shadow.
    /// </summary>
    public const string TypeAndSpacing = "type-and-spacing";

    /// <summary>
    /// The components and their variants.
    /// </summary>
    public const string Components = "components";

    /// <summary>
    /// The voice and the naming.
    /// </summary>
    public const string Words = "words";

    /// <summary>
    /// A change a person asked for.
    /// </summary>
    public const string Revise = "revise";

    /// <summary>
    /// The steps of establishing a design system from nothing.
    /// </summary>
    public static readonly IReadOnlyList<string> Establishing = [Colors, TypeAndSpacing, Components, Words];

    /// <summary>
    /// Gets the steps of establishing a design system.
    /// </summary>
    /// <param name="captured">Whether the running application was captured.</param>
    /// <returns>The steps, in order.</returns>
    public static IReadOnlyList<string> EstablishingSteps(bool captured) => captured ? [RunningApp, .. Establishing] : Establishing;

    /// <summary>
    /// Gets what a step is called to a person.
    /// </summary>
    /// <param name="phase">The step.</param>
    /// <returns>The name.</returns>
    public static string NameOf(string phase) => phase switch
    {
        RunningApp => "Running app",
        Colors => "Colors",
        TypeAndSpacing => "Type, spacing and shape",
        Components => "Components",
        Words => "Voice and naming",
        _ => "The change",
    };

    /// <summary>
    /// Gets what the model is asked to do in a step.
    /// </summary>
    /// <param name="phase">The step.</param>
    /// <returns>The instruction.</returns>
    /// <exception cref="InvalidOperationException">There is no such step.</exception>
    public static string InstructionFor(string phase)
    {
        var text = DesignPrompts.Load(DesignPrompts.DesignSystemSteps);
        foreach (var section in Section().Split(text).Where(section => section.Length > 0))
        {
            var newline = section.IndexOf('\n', StringComparison.Ordinal);
            if (section[..newline].Trim() == phase)
            {
                return section[(newline + 1)..].Trim();
            }
        }

        throw new InvalidOperationException($"There is no design system step named '{phase}'.");
    }

    [GeneratedRegex(@"^## ", RegexOptions.Multiline, 1000)]
    private static partial Regex Section();
}
