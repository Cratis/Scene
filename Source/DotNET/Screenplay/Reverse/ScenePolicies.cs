// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The requirement of an `authorize` as the text a Scene document carries: a policy name, or names combined with `and` / `or`, each
/// combination in parentheses (`(Sellers and Managers)`), the same text Stage writes for the same button.
/// </summary>
static class ScenePolicies
{
    public static string Describe(PolicyRequirementSyntax requirement) => requirement switch
    {
        PolicyReferenceSyntax reference => reference.Name,
        LogicalPolicyRequirementSyntax logical => $"({Describe(logical.Left)} {logical.Operator.ToString().ToLowerInvariant()} {Describe(logical.Right)})",
        _ => string.Empty
    };

    public static AuthorizeSyntax? Parse(string expression)
    {
        var tokens = new Queue<string>(Tokens(expression));
        var requirement = Read(tokens);
        return requirement is not null && tokens.Count == 0 ? new AuthorizeSyntax(requirement, SourceLocation.Start) : null;
    }

    static List<string> Tokens(string expression)
    {
        List<string> tokens = [];
        var word = new System.Text.StringBuilder();
        foreach (var character in expression)
        {
            if (character is '(' or ')' || char.IsWhiteSpace(character))
            {
                if (word.Length > 0)
                {
                    tokens.Add(word.ToString());
                    word.Clear();
                }

                if (!char.IsWhiteSpace(character))
                {
                    tokens.Add(character.ToString());
                }
            }
            else
            {
                word.Append(character);
            }
        }

        if (word.Length > 0)
        {
            tokens.Add(word.ToString());
        }

        return tokens;
    }

    static PolicyRequirementSyntax? Read(Queue<string> tokens)
    {
        var left = Operand(tokens);
        while (left is not null && tokens.Count > 0 && (string.Equals(tokens.Peek(), "and", StringComparison.Ordinal) || string.Equals(tokens.Peek(), "or", StringComparison.Ordinal)))
        {
            var op = string.Equals(tokens.Dequeue(), "and", StringComparison.Ordinal) ? LogicalOperator.And : LogicalOperator.Or;
            var right = Operand(tokens);
            if (right is null)
            {
                return null;
            }

            left = new LogicalPolicyRequirementSyntax(left, op, right, SourceLocation.Start);
        }

        return left;
    }

    static PolicyRequirementSyntax? Operand(Queue<string> tokens)
    {
        if (tokens.Count == 0)
        {
            return null;
        }

        var token = tokens.Dequeue();
        if (string.Equals(token, "(", StringComparison.Ordinal))
        {
            var inner = Read(tokens);
            return inner is not null && tokens.Count > 0 && string.Equals(tokens.Dequeue(), ")", StringComparison.Ordinal) ? inner : null;
        }

        var reserved = string.Equals(token, ")", StringComparison.Ordinal) || string.Equals(token, "and", StringComparison.Ordinal) || string.Equals(token, "or", StringComparison.Ordinal);
        return reserved || !SceneJson.IsIdentifier(token) ? null : new PolicyReferenceSyntax(token, SourceLocation.Start);
    }
}
