// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.for_PackageResolver;

public class when_ordering_the_host_packages : Specification
{
    List<(string Name, string Expected, string Actual)> _orders = null!;
    List<(string Name, string Expected, string Actual)> _resolutions = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "package-resolution-fixtures.json")));
        var root = document.RootElement;

        _orders = [.. root.GetProperty("hostPackageCases").EnumerateArray().Select(element =>
        {
            var packages = HostPackages(element);
            return (element.GetProperty("name").GetString()!, Strings(element.GetProperty("expected")), string.Join(',', packages));
        })];

        _resolutions = [.. root.GetProperty("hostResolutionCases").EnumerateArray().Select(element =>
        {
            var profile = new UiProfile("test", "web", [.. HostPackages(element)]);
            var catalog = element.GetProperty("catalog").EnumerateObject()
                .ToDictionary(property => property.Name, IReadOnlyList<string> (property) => [.. property.Value.EnumerateArray().Select(value => value.GetString()!)]);
            var requested = element.GetProperty("requestedName").GetString()!;
            var expected = element.GetProperty("expected");
            var actual = PackageResolver.Resolve(requested, profile, catalog)!;
            return (
                element.GetProperty("name").GetString()!,
                $"{expected.GetProperty("package").GetString()}|{Strings(expected.GetProperty("shadows"))}",
                $"{actual.Package}|{string.Join(',', actual.Shadows)}");
        })];
    }

    [Fact]
    void should_have_cases() => (_orders.Count > 0 && _resolutions.Count > 0).ShouldBeTrue();

    [Fact]
    void should_order_the_packages_as_expected_for_every_case()
    {
        foreach (var (name, expected, actual) in _orders)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }

    [Fact]
    void should_resolve_as_expected_for_every_case()
    {
        foreach (var (name, expected, actual) in _resolutions)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }

    static string Strings(JsonElement array) => string.Join(',', array.EnumerateArray().Select(value => value.GetString()));

    static IReadOnlyList<string> HostPackages(JsonElement element)
    {
        var kinds = element.GetProperty("kinds").EnumerateObject().ToDictionary(property => property.Name, property => Enum.Parse<PackageKind>(property.Value.GetString()!));
        var declared = element.GetProperty("declared").EnumerateArray().Select(value => value.GetString()!);
        return PackageResolver.HostPackages(declared, element.GetProperty("baseline").GetString()!, kinds);
    }
}
