// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Security.Cryptography;
using System.Text;
using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;
using SceneModel = Cratis.Scene.Screenplay.Forward;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// Parses Cratis Screenplay (<c language="csharp">.play</c>) source by running it through the Screenplay compiler and
/// walking the resulting syntax tree with Stage's <see cref="SceneModel.ScreenplaySceneVisitor"/>.
/// </summary>
/// <remarks>
/// The translation itself is the Scene bridge's - it owns the seam between the language and the
/// object model, so Scene stays unaware Screenplay exists and Screenplay stays unaware of rendering. What
/// this parser adds is only the second walk: the same compiler output an event model parser
/// already produces, read by the other visitor.
/// <para>
/// The same text always gives the same result, so the result is remembered by the hash of the text (a few of the most recent, never by
/// tenant or project: the key is the content). Previewing the next node of a board that has not changed hands over the same document and
/// would otherwise compile it again for every click (StudioIssues#979).
/// </para>
/// </remarks>
public class ScreenplaySceneParser : IScreenplaySceneParser
{
    const int Remembered = 8;

    readonly ScreenplayCompiler _compiler = new();
    readonly Lock _lock = new();
    readonly LinkedList<(string Key, CompilationResult<SceneModel.SceneApplication> Result)> _recent = new();

    /// <inheritdoc/>
    public CompilationResult<SceneModel.SceneApplication> Parse(string source)
    {
        var key = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(source)));
        lock (_lock)
        {
            for (var node = _recent.First; node is not null; node = node.Next)
            {
                if (node.Value.Key == key)
                {
                    _recent.Remove(node);
                    _recent.AddFirst(node);
                    return node.Value.Result;
                }
            }
        }

        var result = Visit(_compiler.Compile(source));
        lock (_lock)
        {
            _recent.AddFirst((key, result));
            while (_recent.Count > Remembered)
            {
                _recent.RemoveLast();
            }
        }

        return result;
    }

    /// <summary>
    /// What Stage refuses or leaves unrendered comes back as named errors, never as an exception.
    /// </summary>
    static CompilationResult<SceneModel.SceneApplication> Visit(CompilationResult<ApplicationSyntax> compilation) =>
        SceneTranslation.Translate(compilation);
}
