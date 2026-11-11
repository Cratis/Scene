// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_PackageList;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    static readonly JsonSerializerOptions _readOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _templateOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    List<ScenePackage> _packages = null!;
    string _pristineCatalog = null!;
    JsonArray _cases = null!;
    List<(string Name, JsonNode Expected, JsonNode Actual)> _results = null!;
    List<string> _mutated = null!;
    string _listing = null!;
    string _themeEdit = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "package-list-fixtures.json")));
        _packages = corpus["packages"].Deserialize<List<ScenePackage>>(_readOptions);
        _cases = corpus["cases"].AsArray();
        _pristineCatalog = JsonSerializer.Serialize(_packages, _options);
    }

    void Because()
    {
        _mutated = [];
        _results = [.. _cases.Select(item =>
        {
            var profile = item["profile"].Deserialize<UiProfile>(_readOptions);
            var packages = item["packages"]?.Deserialize<List<ScenePackage>>(_readOptions) ?? _packages;
            var before = JsonSerializer.Serialize(new { profile, packages }, _options);
            var result = Run(item, profile, packages);
            if (JsonSerializer.Serialize(new { profile, packages }, _options) != before)
            {
                _mutated.Add(item["name"].GetValue<string>());
            }

            return result;
        })];
        _listing = JsonSerializer.Serialize(PackageList.Describe(CaseProfile("a package another needs"), _packages), _options);
        _themeEdit = JsonSerializer.Serialize(PackageList.ChooseTheme(CaseProfile("choose a theme whose package is missing"), _packages, "Material Ocean"), _options);
    }

    UiProfile CaseProfile(string name) =>
        _cases.Single(candidate => candidate["name"].GetValue<string>() == name)["profile"].Deserialize<UiProfile>(_readOptions)!;

    static (string Name, JsonNode Expected, JsonNode Actual) Run(JsonNode item, UiProfile profile, List<ScenePackage> packages)
    {
        var action = item["action"];
        var kind = action["kind"].GetValue<string>();
        var expected = item["expected"];
        JsonNode actual;
        if (kind == "describe")
        {
            var listing = PackageList.Describe(profile, packages);
            actual = new JsonObject { ["rows"] = JsonSerializer.SerializeToNode(listing.Rows, _options), ["addable"] = JsonSerializer.SerializeToNode(listing.Addable, _options) };
            foreach (var entry in actual["rows"].AsArray().Concat(actual["addable"].AsArray()))
            {
                // The package kind is the model's enum, written PascalCase like everywhere else in a profile or package; the engine's own enums are camelCase.
                var packageKind = entry["kind"].GetValue<string>();
                entry["kind"] = char.ToUpperInvariant(packageKind[0]) + packageKind[1..];
            }

            if (expected["suppliers"] is not null)
            {
                actual["suppliers"] = JsonSerializer.SerializeToNode(listing.Suppliers, _options);
            }
        }
        else
        {
            var name = action["name"]?.GetValue<string>() ?? string.Empty;
            var edit = kind switch
            {
                "add" => PackageList.Add(profile, packages, name),
                "remove" => PackageList.Remove(profile, packages, name),
                "move" => PackageList.Move(profile, packages, name, action["direction"].GetValue<string>() == "up" ? MoveDirection.Up : MoveDirection.Down),
                "blueprint" => PackageList.ChooseBlueprint(profile, packages, action["blueprint"].GetValue<string>(), action["shell"]?.GetValue<string>()),
                _ => PackageList.ChooseTheme(profile, packages, action["theme"].GetValue<string>())
            };
            var result = new JsonObject
            {
                ["outcome"] = JsonSerializer.SerializeToNode(edit.Outcome, _options),
                ["packages"] = JsonSerializer.SerializeToNode(edit.Profile.Packages, _options),
                ["added"] = JsonSerializer.SerializeToNode(edit.Added, _options),
                ["removed"] = JsonSerializer.SerializeToNode(edit.Removed, _options),
                ["message"] = edit.Message
            };
            if (edit.Profile.Root is not null)
            {
                result["root"] = JsonNode.Parse(JsonSerializer.Serialize(edit.Profile.Root.Template, _templateOptions));
            }

            if (edit.Profile.Theme is not null)
            {
                result["theme"] = edit.Profile.Theme;
            }

            actual = result;
        }

        return (item["name"].GetValue<string>(), expected.DeepClone(), actual);
    }

    [Fact]
    void should_have_cases_in_the_corpus() => _results.Count.ShouldBeGreaterThan(25);

    [Fact]
    void should_leave_the_profile_and_the_catalog_as_they_were()
    {
        _mutated.ShouldBeEmpty();
        JsonSerializer.Serialize(_packages, _options).ShouldEqual(_pristineCatalog);
    }

    [Fact]
    void should_write_the_listing_the_way_the_designer_reads_it()
    {
        _listing.ShouldEqual(/*lang=json,strict*/ """{"rows":[{"position":1,"name":"material","displayName":"Material Components","version":"1.0.0","kind":"componentLibrary","description":"Material components.","reason":{"kind":"chosen","packages":[],"text":"Chosen"},"canMoveUp":false,"canMoveDown":false},{"position":2,"name":"tailwind","displayName":"Tailwind","version":"1.0.0","kind":"styling","description":"Utility styling.","reason":{"kind":"neededBy","packages":["Material Components"],"text":"Needed by Material Components"},"canMoveUp":false,"canMoveDown":true,"lock":{"kind":"neededBy","packages":["Material Components"],"text":"Tailwind is needed by Material Components, so it stays while they are listed."}},{"position":3,"name":"primereact","displayName":"PrimeReact","version":"1.0.0","kind":"componentLibrary","description":"PrimeReact components.","reason":{"kind":"chosen","packages":[],"text":"Chosen"},"canMoveUp":true,"canMoveDown":false},{"position":4,"name":"core","displayName":"Core","version":"1.0.0","kind":"componentLibrary","description":"The fallback components.","reason":{"kind":"alwaysLast","packages":[],"text":"Always last"},"canMoveUp":false,"canMoveDown":false,"lock":{"kind":"core","packages":[],"text":"Core is the fallback every component name resolves against, so it is always last and cannot be removed."}}],"addable":[{"name":"material-themes","displayName":"Material Themes","version":"1.0.0","kind":"styling","description":"Material themes.","alsoAdds":[],"text":""},{"name":"bp.default","displayName":"Cratis Default","version":"1.4.2","kind":"blueprint","description":"The default blueprint.","alsoAdds":[],"text":""},{"name":"bp.dashboard","displayName":"Dashboard","version":"2.0.0","kind":"blueprint","description":"Horizontal navigation.","alsoAdds":[],"text":""},{"name":"broken","displayName":"Broken","version":"1.0.0","kind":"componentLibrary","description":"Needs a package nobody has.","alsoAdds":[],"text":""}],"suppliers":[{"component":"button","winner":"material","others":["primereact","core"]},{"component":"card","winner":"primereact","others":["core"]},{"component":"datatable","winner":"material","others":["primereact"]},{"component":"table","winner":"core","others":[]}]}""");
    }

    [Fact]
    void should_write_an_edit_with_what_it_added_in_the_order_it_added_it()
    {
        _themeEdit.ShouldEqual(/*lang=json,strict*/ """{"profile":{"name":"Desktop","targetPlatform":"web","packages":["core","tailwind","material","material-themes","primereact"],"theme":"Material Ocean"},"outcome":"changed","added":["tailwind","material","material-themes"],"removed":[],"message":"Theme \u0027Material Ocean\u0027 needs Material Themes, which was added."}""");
    }

    [Fact]
    void should_answer_what_the_corpus_expects_for_every_case()
    {
        var mismatches = _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual.ToJsonString()}").ToList();
        mismatches.ShouldBeEmpty();
    }
}
