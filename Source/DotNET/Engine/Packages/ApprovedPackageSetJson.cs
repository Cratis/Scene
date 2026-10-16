// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Packages;

/// <summary>
/// Reads and writes the approved package set document - the one file a host, the CLI and Stage share to say
/// which custom runtime packages an application may render with.
/// </summary>
/// <remarks>
/// <para>
/// The document is <c language="json">{ "version": 1, "packages": [ { "manifest": { ... }, "module": { ... } } ] }</c>.
/// <c language="json">manifest</c> is the package's <see cref="ScenePackage"/> declaration (name, version, kind, dependencies,
/// the components, layouts, templates and themes it declares); <c language="json">module</c> is its
/// <see cref="PackageModuleReference"/>. Unknown members, duplicate packages, URL style sheets, package kinds a runtime
/// bundle cannot be (icon libraries) and names that collide with the packages a host ships are all refused with a
/// diagnostic rather than ignored.
/// </para>
/// <para>
/// <see cref="Write"/> is canonical: packages in ordinal name order, camel-case members, every list present, so the
/// same set is the same bytes wherever it is written.
/// </para>
/// </remarks>
public static partial class ApprovedPackageSetJson
{
    /// <summary>
    /// The only document version this reader understands.
    /// </summary>
    public const int Version = 1;

    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        Converters = { new JsonStringEnumConverter() }
    };

    /// <summary>
    /// Reads and validates an approved package set document.
    /// </summary>
    /// <param name="json">The document text.</param>
    /// <param name="reservedNames">The names of the packages the host ships, which an approved package may not reuse.</param>
    /// <returns>The set, or the diagnostics explaining why the document cannot be approved.</returns>
    public static ApprovedPackageSetReadResult Read(string json, IEnumerable<string>? reservedNames = null)
    {
        ArgumentNullException.ThrowIfNull(json);

        Document? document;
        try
        {
            document = JsonSerializer.Deserialize<Document>(json, _options);
        }
        catch (JsonException exception)
        {
            return new(null, [$"The package set is not a valid document: {exception.Message}"]);
        }

        if (document is null)
        {
            return new(null, ["The package set is empty."]);
        }

        var diagnostics = new List<string>();
        if (document.Version != Version)
        {
            diagnostics.Add($"The package set declares version {document.Version}, but this host reads version {Version}.");
        }

        var reserved = new HashSet<string>(reservedNames ?? [], StringComparer.Ordinal);
        var packages = new List<ApprovedPackage>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var (entry, index) in (document.Packages ?? []).Select((entry, index) => (entry, index)))
        {
            var package = ToPackage(entry, index, reserved, seen, diagnostics);
            if (package is not null)
            {
                packages.Add(package);
            }
        }

        if (diagnostics.Count > 0)
        {
            return new(null, diagnostics);
        }

        return new(new([.. packages.OrderBy(package => package.Manifest.Name, StringComparer.Ordinal)]), []);
    }

    /// <summary>
    /// Writes the canonical document for a set.
    /// </summary>
    /// <param name="set">The set to write.</param>
    /// <returns>The canonical JSON text, ending with a line feed.</returns>
    public static string Write(ApprovedPackageSet set)
    {
        ArgumentNullException.ThrowIfNull(set);

        var document = new Document
        {
            Version = Version,
            Packages =
            [
                .. set.Packages
                    .OrderBy(package => package.Manifest.Name, StringComparer.Ordinal)
                    .Select(package => new Entry
                    {
                        Manifest = new Manifest
                        {
                            Name = package.Manifest.Name,
                            Version = package.Manifest.Version,
                            Kind = package.Manifest.Kind,
                            Dependencies = [.. package.Manifest.Dependencies.Select(dependency => new Dependency { Name = dependency.Name, VersionRange = dependency.VersionRange })],
                            Components = [.. package.Manifest.Components],
                            Layouts = [.. package.Manifest.Layouts],
                            ScreenTemplates = [.. package.Manifest.ScreenTemplates],
                            DialogTemplates = [.. package.Manifest.DialogTemplates],
                            Themes = [.. package.Manifest.Themes],
                            DisplayName = package.Manifest.DisplayName,
                            Description = package.Manifest.Description,
                            License = package.Manifest.License,
                            LicenseUrl = package.Manifest.LicenseUrl,
                            Assets = [.. package.Manifest.Assets ?? []],
                            RuntimeSingletons = [.. package.Manifest.RuntimeSingletons ?? []]
                        },
                        Module = new Module
                        {
                            Npm = package.Module.Npm,
                            Version = package.Module.Version,
                            Export = package.Module.Export,
                            Styles = [.. package.Module.Styles]
                        }
                    })
            ]
        };

        return $"{JsonSerializer.Serialize(document, _options).ReplaceLineEndings("\n")}\n";
    }

    [GeneratedRegex(@"^(@[a-z0-9][a-z0-9._~-]*/)?[a-z0-9][a-z0-9._~-]*$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex NpmName();

    [GeneratedRegex(@"^[A-Za-z_$][A-Za-z0-9_$]*$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Identifier();

    [GeneratedRegex(@"^[^\s'""`\\]+$", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Plain();

    static ApprovedPackage? ToPackage(Entry entry, int index, HashSet<string> reserved, HashSet<string> seen, List<string> diagnostics)
    {
        var manifest = entry.Manifest;
        var module = entry.Module;
        var label = manifest?.Name is { Length: > 0 } name ? $"Package '{name}'" : $"Package #{index + 1}";
        var before = diagnostics.Count;

        if (manifest is null || module is null)
        {
            diagnostics.Add($"{label} must declare both a manifest and a module.");
            return null;
        }

        if (string.IsNullOrWhiteSpace(manifest.Name) || !Plain().IsMatch(manifest.Name))
        {
            diagnostics.Add($"{label} needs a manifest name without whitespace or quotes.");
        }
        else if (reserved.Contains(manifest.Name))
        {
            diagnostics.Add($"{label} uses the name of a package the host ships; approve it under another name.");
        }
        else if (!seen.Add(manifest.Name))
        {
            diagnostics.Add($"{label} is approved more than once; duplicate packages are ambiguous.");
        }

        if (string.IsNullOrWhiteSpace(manifest.Version) || !Plain().IsMatch(manifest.Version))
        {
            diagnostics.Add($"{label} needs a manifest version.");
        }

        if (manifest.Kind == PackageKind.IconLibrary)
        {
            diagnostics.Add($"{label} is an icon library, which an approved runtime package set cannot provide.");
        }

        if (string.IsNullOrEmpty(module.Npm) || !NpmName().IsMatch(module.Npm))
        {
            diagnostics.Add($"{label} needs a module npm name that is a valid npm package name.");
        }
        else if (manifest.Module is not null && !string.Equals(manifest.Module, module.Npm, StringComparison.Ordinal))
        {
            diagnostics.Add($"{label} declares the manifest module '{manifest.Module}' but is imported from '{module.Npm}'.");
        }

        if (string.IsNullOrWhiteSpace(module.Version) || !Plain().IsMatch(module.Version))
        {
            diagnostics.Add($"{label} needs a module version or range for npm.");
        }

        if (string.IsNullOrEmpty(module.Export) || !Identifier().IsMatch(module.Export))
        {
            diagnostics.Add($"{label} needs a module export that is the name of its runtime bundle.");
        }

        foreach (var style in module.Styles ?? [])
        {
            if (string.IsNullOrEmpty(module.Npm) || !style.StartsWith($"{module.Npm}/", StringComparison.Ordinal) ||
                style.Contains("..", StringComparison.Ordinal) || !Plain().IsMatch(style))
            {
                diagnostics.Add($"{label} style '{style}' must be a path inside its own npm package ('{module.Npm}/...'), never a URL or another package.");
            }
        }

        if (diagnostics.Count > before)
        {
            return null;
        }

        var scenePackage = new ScenePackage(
            manifest.Name!,
            manifest.Version!,
            manifest.Kind,
            [.. (manifest.Dependencies ?? []).Select(dependency => new PackageDependency(dependency.Name ?? string.Empty, dependency.VersionRange))],
            [.. manifest.Components ?? []],
            [.. manifest.Layouts ?? []],
            [.. manifest.ScreenTemplates ?? []],
            [.. manifest.DialogTemplates ?? []],
            [.. manifest.Themes ?? []],
            manifest.DisplayName,
            manifest.Description,
            module.Npm,
            manifest.License,
            manifest.LicenseUrl,
            null,
            null,
            [.. manifest.Assets ?? []],
            [.. manifest.RuntimeSingletons ?? []]);

        return new(scenePackage, new(module.Npm!, module.Version!, module.Export!, [.. module.Styles ?? []]));
    }

    sealed class Document
    {
        public int Version { get; set; }

        public List<Entry>? Packages { get; set; }
    }

    sealed class Entry
    {
        public Manifest? Manifest { get; set; }

        public Module? Module { get; set; }
    }

    sealed class Manifest
    {
        public string? Name { get; set; }

        public string? Version { get; set; }

        public PackageKind Kind { get; set; }

        public List<Dependency>? Dependencies { get; set; }

        public List<string>? Components { get; set; }

        public List<string>? Layouts { get; set; }

        public List<string>? ScreenTemplates { get; set; }

        public List<string>? DialogTemplates { get; set; }

        public List<string>? Themes { get; set; }

        public string? DisplayName { get; set; }

        public string? Description { get; set; }

        public string? Module { get; set; }

        public string? License { get; set; }

        public string? LicenseUrl { get; set; }

        public List<string>? Assets { get; set; }

        public List<string>? RuntimeSingletons { get; set; }

        /// <summary>Gets or sets the gallery metadata of a domain blueprint; design-time only, read and dropped.</summary>
        public JsonElement? Blueprint { get; set; }

        /// <summary>Gets or sets the sample-data packs of a domain blueprint; design-time only, read and dropped.</summary>
        public JsonElement? SampleData { get; set; }
    }

    sealed class Dependency
    {
        public string? Name { get; set; }

        public string? VersionRange { get; set; }
    }

    sealed class Module
    {
        public string? Npm { get; set; }

        public string? Version { get; set; }

        public string? Export { get; set; }

        public List<string>? Styles { get; set; }
    }
}
