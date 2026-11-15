// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The Screenplay release Studio writes and reads, named in what transport tells an author it cannot carry. Taken from
/// the referenced package, so a message never names a release Studio no longer uses.
/// </summary>
public static class ScreenplayVersion
{
    public static string Current { get; } = typeof(Cratis.Screenplay.Syntax.ApplicationSyntax).Assembly.GetName().Version is { } version
        ? $"{version.Major}.{version.Minor}"
        : "unknown";
}
