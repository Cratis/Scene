// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text;
using System.Text.Json;
using Cratis.Screenplay.Syntax;
using Cratis.Screenplay.Syntax.Projections;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// Writes a Screenplay <see cref="ExpressionSyntax"/> as the expression text a Scene condition or binding carries.
/// </summary>
static class ExpressionTexts
{
    /// <summary>
    /// Gets the expression text of an expression: the path it reads, the literal it holds, or the template it interpolates.
    /// </summary>
    /// <param name="expression">The expression to write.</param>
    /// <returns>The expression text; empty when the expression names no value Scene can read (a time, a tenant).</returns>
    public static string Of(ExpressionSyntax expression) =>
        expression switch
        {
            PathExpressionSyntax path => path.Path,
            LiteralExpressionSyntax literal => Literal(literal.Value),
            EventContextExpressionSyntax eventContext => eventContext.Path.Equals("occurred", StringComparison.OrdinalIgnoreCase) ? string.Empty : eventContext.Path,
            ContextExpressionSyntax context => Context(context.Path),
            CausedByExpressionSyntax causedBy => causedBy.Property ?? "id",
            EnvironmentExpressionSyntax environment => environment.Name,
            TemplateExpressionSyntax template => Template(template),
            _ => string.Empty
        };

    static string Context(string path)
    {
        if (path.Equals("occurred", StringComparison.OrdinalIgnoreCase) || path.Equals("tenant", StringComparison.OrdinalIgnoreCase))
        {
            return string.Empty;
        }

        if (path.StartsWith("identity.", StringComparison.OrdinalIgnoreCase))
        {
            return path["identity.".Length..];
        }

        if (path.StartsWith("causedBy.", StringComparison.OrdinalIgnoreCase))
        {
            return path["causedBy.".Length..].ToLowerInvariant() switch
            {
                "subject" => "id",
                "name" => "name",
                "username" => "userName",
                _ => path
            };
        }

        return path;
    }

    static string Template(TemplateExpressionSyntax template)
    {
        var builder = new StringBuilder();
        foreach (var part in template.Parts)
        {
            switch (part)
            {
                case TemplateTextSyntax text:
                    builder.Append(text.Text);
                    break;
                case TemplateInterpolationSyntax interpolation when interpolation.Expression is PathExpressionSyntax path:
                    builder.Append("${").Append(path.Path).Append('}');
                    break;
            }
        }

        return builder.ToString();
    }

    static string Literal(object? value) =>
        value switch
        {
            null => "null",
            string text => JsonSerializer.Serialize(text),
            bool boolean => boolean ? "true" : "false",
            double number => number.ToString(CultureInfo.InvariantCulture),
            _ => JsonSerializer.Serialize(Convert.ToString(value, CultureInfo.InvariantCulture))
        };
}
