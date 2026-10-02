// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public static class DocumentChangeFixtures
{
    public record FixtureCase(
        string Name,
        EditingScope Scope,
        IReadOnlyDictionary<string, string> References,
        string? Previous,
        string Submitted,
        bool Accepted,
        IReadOnlyList<string> Codes);

    public static IReadOnlyList<FixtureCase> Load()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "document-change-fixtures.json")));
        return [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(ToCase)];
    }

    static FixtureCase ToCase(JsonElement element)
    {
        var scope = element.GetProperty("scope");
        var expected = element.GetProperty("expected");
        var previous = element.GetProperty("previous");
        var submitted = element.GetProperty("submitted");

        return new FixtureCase(
            element.GetProperty("name").GetString()!,
            new EditingScope(
                ParseKind(scope.GetProperty("kind").GetString()!),
                scope.GetProperty("name").GetString()!,
                scope.TryGetProperty("layout", out var layout) ? layout.GetString() : null),
            element.GetProperty("references").EnumerateObject().ToDictionary(reference => reference.Name, reference => reference.Value.GetRawText()),
            previous.ValueKind == JsonValueKind.Null ? null : previous.GetRawText(),
            submitted.ValueKind == JsonValueKind.String ? submitted.GetString()! : submitted.GetRawText(),
            expected.GetProperty("accepted").GetBoolean(),
            [.. expected.GetProperty("codes").EnumerateArray().Select(code => code.GetString()!).Order(StringComparer.Ordinal)]);
    }

    static EditingScopeKind ParseKind(string kind) => kind switch
    {
        "screen" => EditingScopeKind.Screen,
        "screenTemplate" => EditingScopeKind.ScreenTemplate,
        "dialogTemplate" => EditingScopeKind.DialogTemplate,
        "layout" => EditingScopeKind.Layout,
        _ => throw new InvalidOperationException($"'{kind}' is not an editing scope kind")
    };

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not locate the repository root (Scene.slnx) above " + AppContext.BaseDirectory);
    }
}
