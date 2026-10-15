// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_TemplateApplicability;

public class when_resolving_template_references_from_the_shared_corpus : Specification
{
    TemplateLibrary _library = null!;
    List<ReferenceCase> _cases = null!;
    List<(ReferenceCase Case, TemplateReferenceResolution Resolution)> _results = null!;

    void Establish()
    {
        var root = FixtureFile.Load();
        _library = root.GetProperty("library").Deserialize<TemplateLibrary>(FixtureFile.Options)!;
        _cases = root.GetProperty("references").Deserialize<List<ReferenceCase>>(FixtureFile.Options)!;
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, TemplateReferenceResolver.Resolve(fixture.Reference, _library)))];

    [Fact]
    void should_resolve_like_the_typescript_engine()
    {
        foreach (var (fixture, resolution) in _results)
        {
            (fixture.Name, Describe(resolution.Status, resolution.Package, resolution.PackageVersion, resolution.Kind, resolution.Message))
                .ShouldEqual((fixture.Name, Describe(fixture.Expected.Status, fixture.Expected.Package, fixture.Expected.Version, fixture.Expected.Kind, fixture.Expected.Message)));
        }
    }

    static string Describe(TemplateReferenceStatus status, string? package, string? version, TemplateCatalogKind? kind, string? message) =>
        $"{status}|{package}|{version}|{kind}|{message}";

    record ExpectedResolution(TemplateReferenceStatus Status, string? Package, string? Version, TemplateCatalogKind? Kind, string? Message);

    record ReferenceCase(string Name, TemplateReference Reference, ExpectedResolution Expected);
}
