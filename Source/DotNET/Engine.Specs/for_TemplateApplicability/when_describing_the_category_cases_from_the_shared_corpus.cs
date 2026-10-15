// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Templates;

namespace Cratis.Scene.Engine.for_TemplateApplicability;

public class when_describing_the_category_cases_from_the_shared_corpus : Specification
{
    List<CategoryCase> _cases = null!;
    List<(CategoryCase Case, IReadOnlyList<TemplateCatalogEntry> Entries)> _described = null!;

    void Establish() => _cases = FixtureFile.Load().GetProperty("categories").Deserialize<List<CategoryCase>>(FixtureFile.Options)!;

    void Because() => _described = [.. _cases.Select(fixture => (fixture, TemplateCatalog.Describe(fixture.Sources)))];

    [Fact]
    void should_report_a_missing_category_as_an_error_for_blueprints_and_a_warning_for_own_templates()
    {
        foreach (var (fixture, entries) in _described)
        {
            var actual = entries.Select(entry => $"{entry.Package}|{entry.Kind}|{entry.Name}|{entry.Compatible}|{string.Join(';', entry.Problems)}|{string.Join(';', entry.Warnings)}");
            var expected = fixture.ExpectedEntries.Select(entry => $"{entry.Package}|{entry.Kind}|{entry.Name}|{entry.Compatible}|{string.Join(';', entry.Problems)}|{string.Join(';', entry.Warnings)}");
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', expected)));
        }
    }

    record ExpectedEntry(string Package, TemplateCatalogKind Kind, string Name, bool Compatible, IReadOnlyList<string> Problems, IReadOnlyList<string> Warnings);

    record CategoryCase(string Name, IReadOnlyList<TemplateSource> Sources, IReadOnlyList<ExpectedEntry> ExpectedEntries);
}
