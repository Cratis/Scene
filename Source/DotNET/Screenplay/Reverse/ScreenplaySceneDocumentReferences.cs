// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

public static class ScreenplaySceneDocumentReferences
{
    public const string Prefix = "studio-scene-document:v1:";

    public static ScreenSyntax ToScreen(string name, string document) =>
        new(name, new FileReferenceSyntax(Prefix + Encode(document), SourceLocation.Start), [], SourceLocation.Start);

    public static bool ContainsReference(string source) => source.Contains(Prefix, StringComparison.Ordinal);

    public static bool TryDecode(FileReferenceSyntax? file, out string document)
    {
        document = string.Empty;
        if (file?.Path is not { } path || !path.StartsWith(Prefix, StringComparison.Ordinal))
        {
            return false;
        }

        try
        {
            document = Decode(path[Prefix.Length..]);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public static string Encode(string document) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes(document)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    static string Decode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + ((4 - (padded.Length % 4)) % 4), '=');
        return Encoding.UTF8.GetString(Convert.FromBase64String(padded));
    }
}
