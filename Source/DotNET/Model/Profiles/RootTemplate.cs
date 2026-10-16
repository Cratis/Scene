// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// The application's root template - its shell. The shell is either a layout or an application-scope screen template with the
/// root role; this reference names it, pinned like any other template reference, and carries the shell's own configuration.
/// </summary>
/// <param name="Template">Which template is the shell: an own template, or a blueprint template with a version pin.</param>
/// <param name="Options">
/// The shell's own configurable items (for example <c language="csharp">navigationMode</c> or <c language="csharp">showFooter</c>), keyed by the
/// shell's exposed option name. <see langword="null"/> when the profile leaves every option at the shell's default.
/// </param>
public record RootTemplate(
    TemplateReference Template,
    IReadOnlyDictionary<string, JsonNode?>? Options = null);
