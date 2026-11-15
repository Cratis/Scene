// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Design.for_DesignSystemStarter;

/// <summary>
/// Compares the starter with default-design-system-fixture.json, which the TypeScript package asserts against the default design system it ships (R6):
/// a product that starts from the starter has the roles, the shell and foundation anatomy and the palette of the default.
/// </summary>
public class when_comparing_with_the_default_design_system : given.a_compiled_starter
{
    JsonObject _fixture = null!;

    void Establish() => _fixture = JsonNode.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "default-design-system-fixture.json")))!.AsObject();

    void Because() => Compile(DesignSystemStarter.Create());

    [Fact] void should_have_the_modes_of_the_default() => _designSystem!.Modes.ShouldEqual(_fixture["modes"]!.AsArray().Select(mode => mode!.GetValue<string>()));

    [Fact] void should_have_the_token_roles_of_the_default() =>
        _designSystem!.Tokens.Select(role => $"{role.Category}.{role.Name}").ShouldEqual(_fixture["tokens"]!.AsArray().Select(role => $"{role!["category"]}.{role["name"]}"));

    [Fact] void should_have_the_components_of_the_default() =>
        _designSystem!.Components.Select(Describe).ShouldEqual(_fixture["components"]!.AsArray().Select(component => Describe(component!)));

    [Fact] void should_have_the_light_palette_of_the_default() => ValuesOf("light").ShouldEqual(Expected("light"));

    [Fact] void should_have_the_dark_palette_of_the_default() => ValuesOf("dark").ShouldEqual(Expected("dark"));

    [Fact] void should_ask_for_the_contrast_of_the_default() =>
        _designSystem!.ContrastRules!.Select(rule => $"{rule.Foreground}/{rule.Background}/{rule.MinimumRatio}")
            .ShouldEqual(_fixture["contrastRules"]!.AsArray().Select(rule => $"{rule!["foreground"]}/{rule["background"]}/{rule["minimumRatio"]!.GetValue<double>()}"));

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory!.FullName;
    }

    static string Describe(DesignComponent component) =>
        $"{component.Name}[{string.Join(',', component.Parts)}]" + string.Concat(component.Variants.Select(variant =>
            $" {variant.Name}({Assignments(variant.Parts)})" + string.Concat((variant.States ?? new Dictionary<string, IReadOnlyDictionary<string, string>>())
                .OrderBy(state => state.Key, StringComparer.Ordinal)
                .Select(state => $" {state.Key}:({Assignments(state.Value)})"))));

    static string Describe(JsonNode component) =>
        $"{component["name"]}[{string.Join(',', component["parts"]!.AsArray().Select(part => part!.GetValue<string>()))}]" + string.Concat(component["variants"]!.AsArray().Select(variant =>
            $" {variant!["name"]}({Assignments(ToDictionary(variant["parts"]!))})" +
            string.Concat((variant["states"]?.AsObject() ?? []).OrderBy(state => state.Key, StringComparer.Ordinal).Select(state => $" {state.Key}:({Assignments(ToDictionary(state.Value!))})"))));

    static Dictionary<string, string> ToDictionary(JsonNode node) => node.AsObject().ToDictionary(item => item.Key, item => item.Value!.GetValue<string>());

    static string Assignments(IReadOnlyDictionary<string, string> assignments) => string.Join(", ", assignments.OrderBy(item => item.Key, StringComparer.Ordinal).Select(item => $"{item.Key}={item.Value}"));

    IEnumerable<string> ValuesOf(string mode) =>
        _designSystem!.Themes.Single().Modes.Single(candidate => candidate.Mode == mode).Tokens.OrderBy(item => item.Key, StringComparer.Ordinal).Select(item => $"{item.Key}={item.Value}");

    IEnumerable<string> Expected(string mode) =>
        _fixture["theme"]![mode]!.AsObject().OrderBy(item => item.Key, StringComparer.Ordinal).Select(item => $"{item.Key}={item.Value!.GetValue<string>()}");
}
