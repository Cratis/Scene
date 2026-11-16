// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Screenplay.Reverse.given;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation.given;

// A Screenplay document with navigation regions read as Scene documents, then printed as Screenplay again and reopened.
public class a_navigated_application : Specification
{
    protected ReopenedSource Imported { get; private set; } = null!;

    protected ReopenedSource Reopened { get; private set; } = null!;

    protected string Exported { get; private set; } = string.Empty;

    protected IReadOnlyList<string> Warnings { get; private set; } = [];

    // The scene documents the import produced, one per screen.
    protected IReadOnlyList<JsonObject> Documents => [.. Imported.CustomCode.Screens.Select(screen => JsonNode.Parse(screen.Document)!.AsObject())];

    protected void RoundTrip(string source)
    {
        Imported = DocumentTransport.Import(source);
        (Exported, Warnings) = ExportWithNavigation(null, keepNavigation: true);
        Reopened = DocumentTransport.Import(Exported);
    }

    // The same documents with the navigation of each replaced, printed again.
    protected (string Exported, IReadOnlyList<string> Warnings) ExportWithNavigation(JsonNode? navigation) => ExportWithNavigation(navigation, keepNavigation: false);

    (string Exported, IReadOnlyList<string> Warnings) ExportWithNavigation(JsonNode? navigation, bool keepNavigation)
    {
        var edited = DocumentTransport.RoleDocuments(Imported).Select(screen =>
        {
            var document = JsonNode.Parse(screen.Document)!.AsObject();
            if (!keepNavigation)
            {
                document.Remove("navigation");
                if (navigation is not null)
                {
                    document["navigation"] = navigation.DeepClone();
                }
            }

            return (screen.ActorId, screen.Role, Document: document.ToJsonString());
        });
        var print = DocumentTransport.Export(edited);
        return (print.Source, print.Warnings);
    }
}
