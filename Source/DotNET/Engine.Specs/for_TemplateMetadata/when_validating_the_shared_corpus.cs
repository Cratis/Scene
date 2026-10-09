// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates.for_TemplateMetadata;

public class when_validating_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<ValidationCase> _validation = null!;
    List<CatalogCase> _catalog = null!;
    List<(ValidationCase Case, IReadOnlyList<string> Problems)> _validated = null!;
    List<(CatalogCase Case, IReadOnlyList<TemplateCatalogEntry> Entries)> _described = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "template-metadata-fixtures.json")));
        _validation = document.RootElement.GetProperty("validation").Deserialize<List<ValidationCase>>(_options)!;
        _catalog = document.RootElement.GetProperty("catalog").Deserialize<List<CatalogCase>>(_options)!;
    }

    void Because()
    {
        _validated = [.. _validation.Select(fixture => (fixture, TemplateMetadataValidation.Validate(fixture.Template, fixture.Metadata)))];
        _described = [.. _catalog.Select(fixture => (fixture, TemplateCatalog.Describe(fixture.Sources, fixture.SceneVersion)))];
    }

    [Fact]
    void should_validate_metadata_like_the_typescript_engine()
    {
        foreach (var (fixture, problems) in _validated)
        {
            (fixture.Name, string.Join('\n', problems)).ShouldEqual((fixture.Name, string.Join('\n', fixture.ExpectedProblems)));
        }
    }

    [Fact]
    void should_describe_the_catalog_like_the_typescript_engine()
    {
        foreach (var (fixture, entries) in _described)
        {
            var actual = entries.Select(entry => $"{entry.Package}|{entry.Kind}|{entry.Name}|{entry.Compatible}|{string.Join(';', entry.Problems)}");
            var expected = fixture.ExpectedEntries.Select(entry => $"{entry.Package}|{entry.Kind}|{entry.Name}|{entry.Compatible}|{string.Join(';', entry.Problems)}");
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', expected)));
        }
    }

    record ValidationCase(string Name, string Template, TemplateMetadata? Metadata, IReadOnlyList<string> ExpectedProblems);

    record ExpectedEntry(string Package, TemplateCatalogKind Kind, string Name, bool Compatible, IReadOnlyList<string> Problems);

    record CatalogCase(string Name, string? SceneVersion, IReadOnlyList<TemplateSource> Sources, IReadOnlyList<ExpectedEntry> ExpectedEntries);
}
