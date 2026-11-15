// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text;
using System.Text.RegularExpressions;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Turns arbitrary model names into valid Screenplay identifiers so the generated <c language="csharp">.play</c> compiles.
/// </summary>
public static partial class ScreenplayIdentifier
{
    [GeneratedRegex(@"\A[A-Za-z_][A-Za-z0-9_]*\z", RegexOptions.None, 1000)]
    private static partial Regex Valid { get; }

    /// <summary>
    /// Gets whether a name is already a Screenplay identifier, so it can be written verbatim.
    /// </summary>
    /// <param name="name">The name to check.</param>
    /// <returns><see langword="true"/> when the name is a letter or underscore followed by letters, digits or underscores.</returns>
    /// <remarks>
    /// This is the ASCII subset of Screenplay's own rule, <c language="csharp">[A-Za-z_]\w*</c> (the binding pattern of its sample data parser), so anything it
    /// accepts parses. Screenplay keeps the rule private, so Studio mirrors it here with the rest of the Screenplay naming.
    /// </remarks>
    public static bool IsValid(string? name) => name is not null && Valid.IsMatch(name);

    /// <summary>
    /// Produces a valid Screenplay identifier from an arbitrary name, preserving it verbatim when it is
    /// already a valid identifier and otherwise stripping invalid characters.
    /// </summary>
    /// <param name="name">The source name.</param>
    /// <returns>A valid Screenplay identifier.</returns>
    public static string From(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Unnamed";
        }

        var builder = new StringBuilder(name.Length);
        foreach (var character in name)
        {
            if (char.IsLetterOrDigit(character) || character == '_')
            {
                builder.Append(character);
            }
        }

        if (builder.Length == 0)
        {
            return "Unnamed";
        }

        // Screenplay identifiers must start with a letter or underscore.
        if (char.IsDigit(builder[0]))
        {
            builder.Insert(0, '_');
        }

        return builder.ToString();
    }

    public static string Specification(string? name)
    {
        var identifier = From(name);
        if (name == identifier || string.IsNullOrWhiteSpace(name))
        {
            return identifier;
        }

        var builder = new StringBuilder(name.Length);
        var startsWord = true;
        foreach (var character in name)
        {
            if (!char.IsLetterOrDigit(character) && character != '_')
            {
                startsWord = true;
                continue;
            }

            builder.Append(startsWord ? char.ToUpperInvariant(character) : character);
            startsWord = false;
        }

        return From(builder.ToString());
    }

    /// <summary>
    /// Produces a valid Screenplay property name from an arbitrary name.
    /// </summary>
    /// <param name="name">The source property name.</param>
    /// <returns>A valid identifier that starts with a lowercase letter or an underscore.</returns>
    /// <remarks>
    /// Screenplay reads a line that starts with an uppercase letter as a type, never as a property, so a property
    /// written as <c language="csharp">AuthorName</c> is rejected. The leading uppercase run is lowercased up to the start of the next
    /// word (<c language="csharp">AuthorName</c> becomes <c language="csharp">authorName</c>, <c language="csharp">URLValue</c> becomes <c language="csharp">urlValue</c>, <c language="csharp">ID</c> becomes
    /// <c language="csharp">id</c>) and a name that already starts with a lowercase letter or underscore is kept verbatim. This is a
    /// generation-time mapping only; the stored model keeps the name as it was authored.
    /// </remarks>
    public static string Property(string? name)
    {
        var identifier = From(name);
        if (!char.IsUpper(identifier[0]))
        {
            return identifier;
        }

        var run = 0;
        while (run < identifier.Length && char.IsUpper(identifier[run]))
        {
            run++;
        }

        // An acronym followed by a word ("URLValue") keeps the last capital, which starts that word.
        var lowered = run > 1 && run < identifier.Length && char.IsLower(identifier[run]) ? run - 1 : run;

        return string.Concat(identifier[..lowered].ToLowerInvariant(), identifier[lowered..]);
    }

    /// <summary>
    /// Produces a valid Screenplay property path - one or more property names separated by dots.
    /// </summary>
    /// <param name="path">The source property path.</param>
    /// <returns>The path with every segment mapped through <see cref="Property"/>.</returns>
    public static string PropertyPath(string? path) =>
        string.IsNullOrEmpty(path) ? From(path) : string.Join('.', path.Split('.').Select(segment => segment.Length == 0 ? segment : Property(segment)));
}
