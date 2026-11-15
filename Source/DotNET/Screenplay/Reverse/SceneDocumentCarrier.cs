// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Security.Cryptography;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The preservation carrier: the exact Scene document, encoded beside the typed screen, for content Screenplay cannot
/// say. It is used only together with a diagnostic naming what could not travel, and static generation refuses it.
/// </summary>
public static class SceneDocumentCarrier
{
    const string MetadataFormPrefix = "StudioSceneDocument";
    const string MetadataCommand = "StudioSceneDocumentTransport";
    const string MetadataLanguage = "csharp";

    public static ScreenCodeSyntax Directive(string actorId, string document) =>
        new(
            new CodeBlockSyntax(MetadataLanguage, actorId + Environment.NewLine + Reference(document), SourceLocation.Start),
            SourceLocation.Start);

    public static FormSyntax Form(string screenName, string actorId, string document) =>
        new(
            MetadataFormPrefix + ShortHash(screenName + actorId + document),
            MetadataCommand,
            null,
            [
                new FormFieldSyntax("screen", screenName, null, null, SourceLocation.Start),
                new FormFieldSyntax("actorId", actorId, null, null, SourceLocation.Start),
                new FormFieldSyntax("document", Reference(document), null, null, SourceLocation.Start)
            ],
            null,
            SourceLocation.Start);

    /// <summary>
    /// Whether the form is a preservation carrier rather than a form the author wrote.
    /// </summary>
    public static bool IsCarrier(FormSyntax form) => form.Name.StartsWith(MetadataFormPrefix, StringComparison.Ordinal);

    /// <summary>
    /// Whether the file reference is a preservation carrier rather than one the author wrote.
    /// </summary>
    public static bool IsCarrier(FileReferenceSyntax file) =>
        file.Path.StartsWith(ScreenplaySceneDocumentReferences.Prefix, StringComparison.Ordinal);

    /// <summary>
    /// Whether the directive is a preservation carrier rather than one the author wrote.
    /// </summary>
    public static bool IsCarrier(ScreenDirectiveSyntax directive) =>
        directive is ScreenCodeSyntax code && code.Code.Code.Contains(ScreenplaySceneDocumentReferences.Prefix, StringComparison.Ordinal);

    public static ImportedScreenDocument? TryImport(Guid sliceId, ScreenSyntax screen, IEnumerable<FormSyntax> forms)
    {
        foreach (var code in screen.Directives.Where(IsCarrier).OfType<ScreenCodeSyntax>())
        {
            var lines = code.Code.Code.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length >= 2 && Decode(lines[1]) is { } document)
            {
                return new(sliceId, ActorOrNull(lines[0]), document);
            }
        }

        foreach (var form in forms.Where(IsCarrier))
        {
            var fields = form.Fields.ToDictionary(field => field.Property, field => field.Label, StringComparer.Ordinal);
            if (string.Equals(fields.GetValueOrDefault("screen"), screen.Name, StringComparison.Ordinal) && Decode(fields.GetValueOrDefault("document")) is { } document)
            {
                return new(sliceId, ActorOrNull(fields.GetValueOrDefault("actorId")), document);
            }
        }

        return ScreenplaySceneDocumentReferences.TryDecode(screen.File, out var preserved) ? new(sliceId, null, preserved) : null;
    }

    static string Reference(string document) => ScreenplaySceneDocumentReferences.Prefix + ScreenplaySceneDocumentReferences.Encode(document);

    static string? Decode(string? reference) =>
        reference?.StartsWith(ScreenplaySceneDocumentReferences.Prefix, StringComparison.Ordinal) == true &&
        ScreenplaySceneDocumentReferences.TryDecode(new FileReferenceSyntax(reference, SourceLocation.Start), out var document)
            ? document
            : null;

    static string? ActorOrNull(string? value) =>
        !string.IsNullOrWhiteSpace(value) ? value : null;

    static string ShortHash(string value) =>
        Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value)))[..12];
}
