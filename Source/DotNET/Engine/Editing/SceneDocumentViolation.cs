// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// One reason a changed document was refused.
/// </summary>
/// <param name="Code">What kind of rule was broken.</param>
/// <param name="Message">A message fit to show the person who made the change.</param>
/// <param name="Subject">What it is about - an instance id, an owner or a layout, template or screen name - when there is one.</param>
public record SceneDocumentViolation(SceneDocumentViolationCode Code, string Message, string? Subject = null)
{
    /// <summary>
    /// Gets the code as the camel-cased name the TypeScript engine uses for the same diagnostic, such as
    /// <c language="csharp">contributionNotExposed</c>.
    /// </summary>
    public string CodeName => JsonNamingPolicy.CamelCase.ConvertName(Code.ToString());
}
