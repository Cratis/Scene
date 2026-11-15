// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Prompts;

/// <summary>
/// The prompts of Scene Design with AI. They are embedded in the assembly, so that what the model is told ships with the package that tells it.
/// </summary>
public static class DesignPrompts
{
    /// <summary>
    /// The name of the system prompt of a design turn.
    /// </summary>
    public const string ScreenDesign = "screen-design";

    /// <summary>
    /// The name of what is added to the system prompt when a turn is given images.
    /// </summary>
    public const string ImageToScreen = "image-to-screen";

    /// <summary>
    /// The name of the system prompt of establishing and revising a design system.
    /// </summary>
    public const string DesignSystem = "design-system";

    /// <summary>
    /// The name of the steps of establishing a design system, one section each.
    /// </summary>
    public const string DesignSystemSteps = "design-system-steps";

    /// <summary>
    /// Reads a prompt.
    /// </summary>
    /// <param name="name">The name of the prompt, one of the constants of this class.</param>
    /// <returns>The prompt text.</returns>
    /// <exception cref="InvalidOperationException">There is no prompt of that name.</exception>
    public static string Load(string name)
    {
        var assembly = typeof(DesignPrompts).Assembly;
        using var stream = assembly.GetManifestResourceStream($"Prompts/{name}.md")
            ?? throw new InvalidOperationException($"There is no prompt named '{name}'.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
