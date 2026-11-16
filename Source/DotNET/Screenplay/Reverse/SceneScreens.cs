// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The screens of one role's Scene document as typed Screenplay screens, with the module forms they reach and the
/// declarations the document brings with it.
/// </summary>
static class SceneScreens
{
    public const string ContentSlot = "content";

    static readonly string[] _rootMembers = ["layouts", "screenTemplates", "dialogTemplates", "screens", "exposures", "instanceContributions", SceneNavigation.Member, SceneOutletLevels.Member, SceneNative.Member];
    static readonly string[] _screenMembers = ["name", "layout", "slotContent", "forms", "contributions", "screenTemplate", "behaviors", "fits", SceneNative.Member];

    public static (IReadOnlyList<ScreenSyntax> Screens, IReadOnlyList<FormSyntax> Forms, SceneDeclarationSet Declarations) ToSyntax(string role, JsonObject root, SceneTransportGaps gaps, bool includeNative = true)
    {
        DocumentGaps(role, root, gaps);
        var screens = SceneJson.Array(root, "screens").OfType<JsonObject>().ToArray();
        var sceneNames = screens.Select(screen => SceneJson.String(screen, "name") ?? string.Empty).ToArray();
        var names = SceneNative.VerbatimNamesOf(root, sceneNames) ?? new SceneScreenNames(role, sceneNames);
        var levels = SceneOutletLevels.Read(root, SceneNavigation.NavigationNamesOf(root), gaps);
        List<ScreenSyntax> result = [];
        List<FormSyntax> forms = [];
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var screen in screens)
        {
            var sceneName = SceneJson.String(screen, "name") ?? string.Empty;
            if (!seen.Add(sceneName) || (sceneName != SceneScreenNames.PrimarySceneScreen && !SceneJson.IsIdentifier(sceneName)))
            {
                gaps.Add($"Scene screen '{sceneName}' cannot travel as typed Screenplay: its name is not a Screenplay name or is used by another screen of the document.");
                continue;
            }

            var authoredForms = SceneJson.Array(screen, "forms").OfType<JsonObject>().Select(form => SceneForms.ToSyntax(form, names, gaps)).OfType<FormSyntax>().ToArray();
            var screenForms = SceneForms.WithPlacedCommandForms(screen, authoredForms);
            forms.AddRange(screenForms);
            var scope = new SceneElementScope(names, gaps, includeNative);
            result.Add(new ScreenSyntax(names.ToScreenplay(sceneName), null, Directives(screen, screenForms, scope), SourceLocation.Start)
            {
                Contributions = [.. SceneContributions.ToSyntax(screen, $"screen '{sceneName}'", scope), .. SceneNative.Contributions(screen, scope)],
                Outlets = levels.ScreenOutlets(sceneName),
                Fits = Fits(screen, $"screen '{sceneName}'", gaps)
            });
        }

        SceneOutletLevels.ScreensTransported(levels, screens.Select(screen => SceneJson.String(screen, "name") ?? string.Empty).Where(name => result.Exists(transported => transported.Name == names.ToScreenplay(name))), gaps);

        var declarations = new SceneDeclarationSet(
            [.. SceneTemplates.Layouts(root, gaps)],
            [.. SceneTemplates.ScreenTemplates(root, gaps, includeNative)],
            [.. SceneTemplates.DialogTemplates(root, gaps, includeNative)],
            [.. SceneExposures.Exposures(root, gaps)],
            [.. SceneExposures.Instances(root, names, gaps)])
        {
            Navigation = SceneNavigation.ToSyntax(root, gaps),
            FeatureOutlets = levels.Features
        };

        return (result, forms, declarations);
    }

    /// <summary>
    /// One role's screens read back as its Scene document, together with the declarations of the application they are in.
    /// 'screens' names every screen of the application, so an instance contribution of another role's screen stays there.
    /// </summary>
    public static JsonObject ToJson(string role, IEnumerable<ScreenSyntax> screens, IEnumerable<FormSyntax> forms, SceneDeclarationSet declarations, IEnumerable<string> allScreens, bool verbatim = false)
    {
        var group = screens.ToArray();
        var names = verbatim ? SceneScreenNames.OfOwnScreens(group.Select(screen => screen.Name)) : SceneScreenNames.ForScreenplay(role, group.Select(screen => screen.Name));
        var moduleForms = forms.ToArray();
        var navigationNames = SceneNavigation.NavigationNames(declarations.Navigation?.Outlets ?? []);
        var document = new JsonObject
        {
            ["layouts"] = new JsonArray(),
            ["screenTemplates"] = new JsonArray(),
            ["dialogTemplates"] = new JsonArray(),
            ["screens"] = new JsonArray([.. group.Select(screen => (JsonNode)Screen(screen, moduleForms, names))]),
            ["exposures"] = new JsonArray(),
            ["instanceContributions"] = new JsonArray()
        };

        SceneOutletLevels.Attach(document, SceneOutletLevels.ToJson(group.Select(screen => (names.ToScene(screen.Name), (IReadOnlyList<OutletSyntax>)[.. screen.Outlets])), [], navigationNames));
        declarations.WriteTo(document, names, [.. allScreens, .. group.Select(screen => screen.Name)]);
        if (verbatim)
        {
            SceneNative.AttachVerbatimNames(document, names);
        }

        return document;
    }

    static List<ScreenDirectiveSyntax> Directives(JsonObject screen, IReadOnlyList<FormSyntax> forms, SceneElementScope scope)
    {
        var owner = $"screen '{SceneJson.String(screen, "name")}'";
        var gaps = scope.Gaps;
        var names = scope.Names;
        gaps.UnknownMembers(screen, owner, _screenMembers);
        var slots = SceneJson.Object(screen, "slotContent") ?? [];
        var anchors = forms.Select(form => form.For).Distinct(StringComparer.Ordinal)
            .Select(command => (ScreenDirectiveSyntax)new ScreenActionSyntax(command, null, null, SourceLocation.Start));
        var behaviors = SceneBehaviors.ToSyntax(screen["behaviors"], owner, names, gaps)
            .Select(behavior => (ScreenDirectiveSyntax)new ScreenBehaviorSyntax(behavior, SourceLocation.Start));

        if (SceneJson.String(screen, "screenTemplate") is { } template)
        {
            if (!SceneJson.IsIdentifier(template) || !SceneJson.IsEmpty(screen["behaviors"]))
            {
                gaps.Member(owner, "screenTemplate", "Screenplay 4.120 fills a template with slots alone and names templates as identifiers");
            }

            var filled = slots.Select((slot, index) => new ScreenSlotSyntax(
                slot.Key,
                [.. SceneNative.Weave(SceneElements.ToDirectives(slot.Value, scope), SceneNative.ScreenSlotOf(screen, slot.Key), scope), .. index == 0 ? anchors : []],
                SourceLocation.Start)).ToArray();
            var (blueprint, version) = SceneNative.TemplateReferenceOf(screen, scope);
            return [.. SceneNative.Weave([new ScreenTemplateReferenceSyntax(template, filled, SourceLocation.Start) { Blueprint = blueprint, Version = version }], SceneNative.ScreenTopLevel(screen), scope)];
        }

        foreach (var slot in slots.Where(slot => slot.Key != ContentSlot))
        {
            gaps.Member(owner, "slotContent." + slot.Key, "without a screen template a Studio screen has only its content slot");
        }

        return [.. SceneNative.Weave(SceneElements.ToDirectives(slots[ContentSlot], scope), SceneNative.ScreenSlotOf(screen, ContentSlot), scope), .. behaviors, .. anchors];
    }

    static JsonObject Screen(ScreenSyntax screen, IReadOnlyList<FormSyntax> moduleForms, SceneScreenNames names)
    {
        var template = screen.Directives.OfType<ScreenTemplateReferenceSyntax>().FirstOrDefault();
        var directives = template?.Slots.SelectMany(slot => slot.Directives) ?? screen.Directives;
        var commands = directives.OfType<ScreenActionSyntax>().Select(action => action.Command).ToHashSet(StringComparer.Ordinal);
        var forms = moduleForms.Where(form => commands.Contains(form.For)).ToArray();
        var formCommands = forms.Select(form => form.For).ToHashSet(StringComparer.Ordinal);
        IEnumerable<ScreenDirectiveSyntax> Content(IEnumerable<ScreenDirectiveSyntax> content) =>
            content.Where(directive => directive is not ScreenActionSyntax action || !formCommands.Contains(action.Command));

        var json = new JsonObject
        {
            ["name"] = names.ToScene(screen.Name),
            ["layout"] = SceneDocumentCanonicalForm.StudioLayoutName,
            ["slotContent"] = template is null
                ? new JsonObject { [ContentSlot] = SceneElementImport.ToElements(Content(screen.Directives), names) }
                : new JsonObject(template.Slots.Select(slot => KeyValuePair.Create(slot.Name, (JsonNode?)SceneElementImport.ToElements(Content(slot.Directives), names)))),
            ["forms"] = new JsonArray([.. forms.Select(form => (JsonNode)SceneForms.ToJson(form, names))]),
            ["contributions"] = SceneContributions.ToJson(screen.Contributions, names)
        };

        // What a screen holds that no Scene element can: each container's own, and the contributions that are not one element.
        var slotNatives = template is null
            ? new Dictionary<string, JsonArray> { [ContentSlot] = SceneNative.Capture(Content(screen.Directives)) }
            : template.Slots.ToDictionary(slot => slot.Name, slot => SceneNative.Capture(Content(slot.Directives), names: names), StringComparer.Ordinal);
        var topLevel = template is null
            ? []
            : SceneNative.Capture(screen.Directives, directive => ReferenceEquals(directive, template));
        SceneNative.AttachScreen(json, topLevel, slotNatives, SceneNative.CaptureContributions(screen.Contributions.Where(contribution => !SceneContributions.IsCarried(contribution))));

        if (template is not null)
        {
            json["screenTemplate"] = template.Name;
            SceneNative.AttachTemplateReference(json, template.Blueprint, template.Version);
        }

        var behaviors = SceneBehaviors.ToJson(SceneElementImport.Behaviors(screen.Directives), names);
        if (behaviors.Count > 0)
        {
            json["behaviors"] = behaviors;
        }

        if (screen.Fits.Any())
        {
            json["fits"] = new JsonArray([.. screen.Fits.Select(fit => (JsonNode)fit.ToString().ToLowerInvariant())]);
        }

        return json;
    }

    /// <summary>
    /// The places a screen fits, in order of preference (`fits dialog, drawer, pane`). A screen that lists none says nothing, and is taken to fit a dialog.
    /// </summary>
    static List<ScreenFit> Fits(JsonObject screen, string owner, SceneTransportGaps gaps)
    {
        List<ScreenFit> fits = [];
        foreach (var fit in SceneJson.Array(screen, "fits"))
        {
            if (Enum.TryParse<ScreenFit>(fit is JsonValue value && value.TryGetValue<string>(out var text) ? text : null, true, out var known) && !fits.Contains(known))
            {
                fits.Add(known);
            }
            else
            {
                gaps.Member(owner, "fits", "a screen fits a dialog, drawer, pane, panel or page, each named once");
                return [];
            }
        }

        return fits;
    }

    static void DocumentGaps(string role, JsonObject root, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(root, "document", _rootMembers);
        if (role.Contains(SceneScreenNames.Separator, StringComparison.Ordinal))
        {
            gaps.Add($"Scene document for role '{role}' cannot travel as typed Screenplay: the role's name contains '{SceneScreenNames.Separator}', which separates a role from its screens.");
        }

        // Screenplay 4.120 declares layouts and ties one to a ui profile, but a screen still cannot name the layout it is
        // drawn in - so a Studio screen is drawn in the Studio screen layout, and any other one stays on the carrier.
        foreach (var screen in SceneJson.Array(root, "screens").OfType<JsonObject>()
            .Where(screen => SceneJson.String(screen, "layout") is { } layout && layout != SceneDocumentCanonicalForm.StudioLayoutName))
        {
            gaps.Member($"screen '{SceneJson.String(screen, "name")}'", "layout", "Screenplay 4.120 screens do not name a layout");
        }
    }
}
