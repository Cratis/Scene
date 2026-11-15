// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using SceneModel = Cratis.Scene.Screenplay.Forward;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// Defines a parser that turns Cratis Screenplay (<c language="csharp">.play</c>) source into the Scene object model a
/// renderer can execute.
/// </summary>
/// <remarks>
/// The sibling of the parser that produces an event model. Both
/// compile the same source; they differ in which half of it they read. This one reads the <c language="csharp">screen</c>,
/// <c language="csharp">layout</c>, <c language="csharp">form</c>, <c language="csharp">theme</c> and <c language="csharp">ui profile</c> constructs, and produces what
/// <c language="csharp">Scene.Engine</c> renders.
/// </remarks>
public interface IScreenplaySceneParser
{
    /// <summary>
    /// Parses the given Screenplay source into a <see cref="SceneModel.SceneApplication"/>.
    /// </summary>
    /// <param name="source">The Screenplay (<c language="csharp">.play</c>) source text.</param>
    /// <returns>
    /// The compilation result carrying the translated <see cref="SceneModel.SceneApplication"/> together
    /// with any diagnostics produced by the Screenplay compiler.
    /// </returns>
    CompilationResult<SceneModel.SceneApplication> Parse(string source);
}
