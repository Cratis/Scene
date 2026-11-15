// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.Session;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Screenplay;
using Cratis.Scene.Screenplay.Forward;
using Cratis.Scene.Screenplay.Reverse;
using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;
using DiagnosticSeverity = Cratis.Screenplay.Diagnostics.DiagnosticSeverity;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// Carries Screenplay text to a Scene document and back: what the AI writes is Screenplay, what the design operations edit is a Scene document.
/// </summary>
/// <remarks>
/// The screens a design holds are compiled together with the Screenplay of the application they are designed for, so what they name - shapes,
/// queries, templates, a design system - is checked where it is declared. The compiler's diagnostics are reported against the text that wrote them.
/// </remarks>
/// <param name="application">The Screenplay of the application the design is for.</param>
internal sealed partial class ScreenplayBridge(string application)
{
    /// <summary>
    /// The module the screen templates of a design are declared in, so that a text can declare one at its own top level.
    /// </summary>
    public const string TemplateModule = "DesignTemplates";

    const string StudioScreenLayout = "StudioScreen";

    static readonly ScreenplayCompiler _compiler = new();
    static readonly ScreenplayPrinter _printer = new();

    /// <summary>
    /// Gets the names the texts of a design declare - the screens, or the screen templates.
    /// </summary>
    /// <param name="text">The Screenplay text.</param>
    /// <param name="mode">Whether the text declares screens or screen templates.</param>
    /// <returns>The names, in the order they are declared.</returns>
    public static IReadOnlyList<string> Declared(string text, DesignMode mode) =>
        mode == DesignMode.Templates ? [.. TemplateName().Matches(text).Select(match => match.Groups["name"].Value)] : [.. ScreenName().Matches(text).Select(match => match.Groups["name"].Value)];

    /// <summary>
    /// Gets the shapes a text declares at its top level.
    /// </summary>
    /// <param name="text">The Screenplay text.</param>
    /// <returns>The names of the shapes.</returns>
    public static IReadOnlySet<string> DeclaredShapes(string text) => ShapeName().Matches(text).Select(match => match.Groups["name"].Value).ToHashSet(StringComparer.Ordinal);

    /// <summary>
    /// Compiles the texts of a design together with the application and reads them as one Scene document.
    /// </summary>
    /// <param name="texts">The Screenplay text of each screen - or screen template - in order.</param>
    /// <param name="mode">Whether the texts are screens or screen templates.</param>
    /// <returns>The document, or the diagnostics that say why there is none.</returns>
    public BridgeDocument ToDocument(IReadOnlyList<string> texts, DesignMode mode)
    {
        var (source, segments) = Compose(texts, mode);
        var compilation = _compiler.Compile(source);
        List<DesignDiagnostic> diagnostics = [];
        foreach (var diagnostic in compilation.Diagnostics)
        {
            if (diagnostic.Severity != DiagnosticSeverity.Error && !InSegment(diagnostic.Location.Line, segments))
            {
                continue;
            }

            diagnostics.Add(Report(diagnostic, segments));
        }

        if (compilation.Value is not { } syntax || diagnostics.Exists(diagnostic => diagnostic.Severity == "error"))
        {
            return new(null, diagnostics);
        }

        var translated = SceneTranslation.Translate(compilation);
        if (translated.Value is not { } scene)
        {
            diagnostics.AddRange(translated.Diagnostics.Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error).Select(diagnostic => Report(diagnostic, segments)));
            return new(null, diagnostics);
        }

        foreach (var conversion in scene.ConversionDiagnostics.Where(conversion => InSegment(conversion.Location.Line, segments)))
        {
            diagnostics.Add(Report(conversion.ToDiagnostic(), segments));
        }

        var free = SceneDocumentApplication.Read(syntax).FirstOrDefault(document => document.RoleName is null && document.ActorId is null);
        var screens = free is null ? [] : Screens(free.Document);
        return new(Document(scene, screens), diagnostics);
    }

    /// <summary>
    /// Prints a screen, or a screen template, of a document as Screenplay.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <param name="name">The name of the screen or the screen template.</param>
    /// <param name="mode">Whether it is a screen or a screen template.</param>
    /// <param name="shapesDeclaredElsewhere">The shapes some other text of the design declares, which the text does not declare again.</param>
    /// <returns>The Screenplay text; <see langword="null"/> when what the document holds cannot be said as Screenplay.</returns>
    public string? ToText(SceneDocument document, string name, DesignMode mode, IReadOnlySet<string> shapesDeclaredElsewhere)
    {
        try
        {
            return mode == DesignMode.Templates ? TemplateText(document, name) : ScreenText(document, name, shapesDeclaredElsewhere);
        }
        catch (UnsupportedSyntaxForPrinting)
        {
            return null;
        }
    }

    static string? ScreenText(SceneDocument document, string name, IReadOnlySet<string> shapesDeclaredElsewhere)
    {
        var screen = document.Screens.Select(element => JsonNode.Parse(element.GetRawText())).OfType<JsonObject>().FirstOrDefault(candidate => NameOf(candidate) == name);
        if (screen is null)
        {
            return null;
        }

        var free = (JsonObject)screen.DeepClone();
        free["owner"] = string.Empty;
        free["path"] = new JsonArray();

        // A free screen names no layout; the editor's own is what a screen read from Screenplay has.
        free["layout"] = StudioScreenLayout;
        var alone = new JsonObject
        {
            ["layouts"] = new JsonArray(Layout()),
            ["screenTemplates"] = new JsonArray(),
            ["dialogTemplates"] = new JsonArray(),
            ["screens"] = new JsonArray(free),
            ["native"] = new JsonObject { ["verbatimNames"] = new JsonObject { [name] = name } }
        };
        var (_, declarations) = SceneFreeScreens.Extract(alone.ToJsonString(SceneDocumentJson.Options));
        if (declarations.Screens.Count == 0 || declarations.Diagnostics.Count > 0)
        {
            return null;
        }

        return _printer.Print(new ApplicationSyntax([], [], [], [], SourceLocation.Start)
        {
            Shapes = [.. declarations.Shapes.Where(shape => !shapesDeclaredElsewhere.Contains(shape.Name))],
            Screens = [.. declarations.Screens.Select(declared => declared.Screen)]
        }).TrimEnd();
    }

    static string? TemplateText(SceneDocument document, string name)
    {
        var template = document.ScreenTemplates.Select(element => JsonNode.Parse(element.GetRawText())).OfType<JsonObject>().FirstOrDefault(candidate => NameOf(candidate) == name);
        if (template is null)
        {
            return null;
        }

        var alone = new JsonObject { ["layouts"] = new JsonArray(), ["screenTemplates"] = new JsonArray(template.DeepClone()), ["dialogTemplates"] = new JsonArray(), ["screens"] = new JsonArray() };
        var declarations = SceneDocumentScreenplayBridge.Declarations([alone.ToJsonString(SceneDocumentJson.Options)], []);
        if (declarations.ScreenTemplates.Count == 0)
        {
            return null;
        }

        var printed = _printer.Print(new ApplicationSyntax([], [], [], [new ModuleSyntax(TemplateModule, declarations.ScreenTemplates, [], SourceLocation.Start)], SourceLocation.Start)).TrimEnd();
        return Unwrap(printed);
    }

    static string Unwrap(string moduleText)
    {
        var lines = moduleText.Split('\n').Select(line => line.TrimEnd('\r')).ToList();
        if (lines.Count > 0 && lines[0].StartsWith("module ", StringComparison.Ordinal))
        {
            lines.RemoveAt(0);
        }

        return string.Join('\n', lines.Select(line => line.StartsWith("  ", StringComparison.Ordinal) ? line[2..] : line)).Trim('\n');
    }

    static JsonObject Layout() => new() { ["name"] = StudioScreenLayout, ["slots"] = new JsonArray(new JsonObject { ["name"] = "content" }) };

    static string NameOf(JsonObject element) => element["name"]?.GetValue<string>() ?? string.Empty;

    /// <summary>
    /// The screens of a document read from free screens, under the names they were written with: the editor calls the first one of them 'Screen' and
    /// the document remembers the name it was written with.
    /// </summary>
    /// <param name="document">The document, as JSON.</param>
    /// <returns>The screens.</returns>
    static List<JsonElement> Screens(string document)
    {
        var root = JsonNode.Parse(document)!.AsObject();
        var pairs = (root["native"] as JsonObject)?["verbatimNames"] as JsonObject;
        var renamed = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var (scene, written) in pairs ?? [])
        {
            if (written is JsonValue value && value.TryGetValue<string>(out var name) && !string.Equals(name, scene, StringComparison.Ordinal))
            {
                renamed[scene] = name;
            }
        }
        var screens = (root["screens"] as JsonArray ?? []).OfType<JsonObject>().ToList();
        foreach (var screen in screens)
        {
            Rename(screen, renamed);
        }

        return [.. screens.Select(screen => JsonSerializer.SerializeToElement(screen, SceneJson.Options))];
    }

    static void Rename(JsonNode? node, Dictionary<string, string> renamed)
    {
        switch (node)
        {
            case JsonObject json:
                foreach (var key in json.Select(pair => pair.Key).ToList())
                {
                    if ((key == "name" || key == "screen") && json[key] is JsonValue value && value.TryGetValue<string>(out var text) && renamed.TryGetValue(text, out var written))
                    {
                        json[key] = written;
                    }
                    else
                    {
                        Rename(json[key], renamed);
                    }
                }

                break;
            case JsonArray array:
                foreach (var item in array)
                {
                    Rename(item, renamed);
                }

                break;
        }
    }

    static SceneDocument Document(SceneApplication scene, IReadOnlyList<JsonElement> screens) => new()
    {
        Layouts = [JsonSerializer.SerializeToElement(Layout(), SceneJson.Options), .. scene.Layouts.Select(layout => JsonSerializer.SerializeToElement(layout, SceneJson.Options))],
        ScreenTemplates = [.. scene.ScreenTemplates.Select(template => JsonSerializer.SerializeToElement(template, SceneJson.Options))],
        DialogTemplates = [.. scene.DialogTemplates.Select(template => JsonSerializer.SerializeToElement(template, SceneJson.Options))],
        Screens = screens,
        Exposures = scene.Exposures,
        InstanceContributions = scene.InstanceContributions
    };

    static bool InSegment(int line, IReadOnlyList<TextSegment> segments) => segments.Any(segment => line >= segment.First && line <= segment.Last);

    static DesignDiagnostic Report(Diagnostic diagnostic, IReadOnlyList<TextSegment> segments)
    {
        var segment = segments.FirstOrDefault(candidate => diagnostic.Location.Line >= candidate.First && diagnostic.Location.Line <= candidate.Last);
        var severity = diagnostic.Severity == DiagnosticSeverity.Error ? "error" : "warning";
        var where = segment is null ? " (in the application's Screenplay)" : $" (line {diagnostic.Location.Line - segment.First + 1} of the text of {segment.Name})";
        return new DesignDiagnostic($"screenplay:{diagnostic.Code}", severity, diagnostic.Message + where, segment?.Name);
    }

    [GeneratedRegex(@"^screen\s+(?<name>[A-Za-z_][\w-]*)", RegexOptions.Multiline | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex ScreenName();

    [GeneratedRegex(@"^screen\s+template\s+(?<name>[A-Za-z_][\w-]*)", RegexOptions.Multiline | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex TemplateName();

    [GeneratedRegex(@"^shape\s+(?<name>[A-Za-z_][\w-]*)", RegexOptions.Multiline | RegexOptions.ExplicitCapture, 1000)]
    private static partial Regex ShapeName();

    (string Source, IReadOnlyList<TextSegment> Segments) Compose(IReadOnlyList<string> texts, DesignMode mode)
    {
        var builder = new StringBuilder(application.TrimEnd());
        var line = application.TrimEnd().Count(character => character == '\n') + 1;
        List<TextSegment> segments = [];
        if (mode == DesignMode.Templates && texts.Count > 0)
        {
            builder.Append("\n\nmodule ").Append(TemplateModule);
            line += 2;
        }

        foreach (var text in texts)
        {
            var body = text.Trim('\n', '\r');
            var lines = body.Split('\n').Select(item => item.TrimEnd('\r')).ToArray();
            if (mode == DesignMode.Templates)
            {
                builder.Append('\n');
                line++;
                var first = line;
                builder.AppendJoin('\n', lines.Select(item => item.Length == 0 ? item : "  " + item));
                line += lines.Length - 1;
                segments.Add(new(string.Join(", ", Declared(body, mode)), first, line));
                continue;
            }

            builder.Append("\n\n");
            line += 2;
            var start = line;
            builder.AppendJoin('\n', lines);
            line += lines.Length - 1;
            segments.Add(new(string.Join(", ", Declared(body, mode)), start, line));
        }

        return (builder.ToString(), segments);
    }

    sealed record TextSegment(string Name, int First, int Last);
}
