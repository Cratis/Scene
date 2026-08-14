// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Reflection;
using System.Text.Json;

namespace Cratis.Scene.Model.for_SceneModelShape;

public class when_reflecting_the_public_shape : Specification
{
    Dictionary<string, string[]> _expectedTypes = null!;
    Dictionary<string, string[]> _expectedEnums = null!;
    Dictionary<string, string[]> _actualTypes = null!;
    Dictionary<string, string[]> _actualEnums = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "scene-model-shape.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _expectedTypes = document.RootElement.GetProperty("types")
            .EnumerateObject()
            .ToDictionary(_ => _.Name, _ => _.Value.EnumerateArray().Select(value => value.GetString()!).Order().ToArray());

        _expectedEnums = document.RootElement.GetProperty("enums")
            .EnumerateObject()
            .ToDictionary(_ => _.Name, _ => _.Value.EnumerateArray().Select(value => value.GetString()!).Order().ToArray());

        var modelAssembly = typeof(Screens.Screen).Assembly;
        var exportedTypes = modelAssembly.GetExportedTypes();

        _actualTypes = exportedTypes
            .Where(type => !type.IsEnum)
            .ToDictionary(
                type => type.Name,
                type => type
                    .GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                    .Select(property => ToCamelCase(property.Name))
                    .Order()
                    .ToArray());

        _actualEnums = exportedTypes
            .Where(type => type.IsEnum)
            .ToDictionary(type => type.Name, type => Enum.GetNames(type).Order().ToArray());
    }

    [Fact] void should_declare_exactly_the_manifest_types() => _actualTypes.Keys.Order().ShouldContainOnly(_expectedTypes.Keys.Order());
    [Fact] void should_declare_exactly_the_manifest_enums() => _actualEnums.Keys.Order().ShouldContainOnly(_expectedEnums.Keys.Order());

    [Fact]
    void should_have_matching_own_properties_for_every_type()
    {
        foreach (var (typeName, expectedProperties) in _expectedTypes)
        {
            _actualTypes.TryGetValue(typeName, out var actualProperties);
            actualProperties!.ShouldContainOnly(expectedProperties);
        }
    }

    [Fact]
    void should_have_matching_members_for_every_enum()
    {
        foreach (var (enumName, expectedMembers) in _expectedEnums)
        {
            _actualEnums.TryGetValue(enumName, out var actualMembers);
            actualMembers!.ShouldContainOnly(expectedMembers);
        }
    }

    static string ToCamelCase(string name) => char.ToLowerInvariant(name[0]) + name[1..];

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
