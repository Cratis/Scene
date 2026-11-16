// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.given;

// Scene documents carried through Screenplay source and read back, without a board: what the bridge alone does.
public static class DocumentTransport
{
    public const string DefaultRole = "UI";

    // Screenplay source, compiled and read back as the Scene documents it holds.
    public static ReopenedSource Import(string source)
    {
        var compilation = new ScreenplayCompiler().Parse(source);
        return new(compilation, new(compilation.Value is { } application ? SceneDocumentApplication.Read(application) : []));
    }

    // Role documents printed as one Screenplay application.
    public static SceneDocumentApplicationPrint Export(IEnumerable<(string ActorId, string Role, string Document)> documents)
    {
        var sliceId = Guid.NewGuid();
        return SceneDocumentApplication.Print([.. documents.Select(document => new SceneModuleDocument(sliceId, document.ActorId, document.Role, document.Document))]);
    }

    // The documents a reading holds, as the role documents they print from.
    public static IEnumerable<(string ActorId, string Role, string Document)> RoleDocuments(ReopenedSource source) =>
        source.CustomCode.Screens.Select(screen => (screen.ActorId ?? screen.RoleName ?? DefaultRole, screen.RoleName ?? DefaultRole, screen.Document));
}

public sealed record ReopenedSource(CompilationResult<ApplicationSyntax> Compilation, ReopenedDocuments CustomCode);

public sealed record ReopenedDocuments(IReadOnlyList<ImportedScreenDocument> Screens);
