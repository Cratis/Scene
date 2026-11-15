// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.ComponentModel;
using System.Text.Json;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.AI.Workbench;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.Operations;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.Tools;

/// <summary>
/// The tools a design turn gives the model: read tools over the catalogue and the design, which stand in for a catalogue in the prompt, and write tools
/// whose answer is the diagnostics the model repairs from.
/// </summary>
/// <param name="workbench">The design the tools work on.</param>
/// <param name="progress">Where the tools report what they are doing.</param>
internal sealed partial class DesignToolbox(DesignWorkbench workbench, IProgress<DesignTurnProgress>? progress)
{
    static readonly JsonSerializerOptions _json = new(DesignJson.Options) { WriteIndented = false };

    /// <summary>
    /// Gets the names of every tool, read tools first.
    /// </summary>
    public static IReadOnlyList<string> Names { get; } =
    [
        "listComponents", "describeComponent", "listTemplates", "describeTemplate", "queryDesignSystem", "queryModel", "listScreens", "readScreen",
        "readComments", "readStorylines", "writeScreen", "applyOperations", "proposeVariations", "proposeTweaks", "proposeDesignSystemChange", "finish"
    ];

    /// <summary>
    /// Creates the tools.
    /// </summary>
    /// <returns>The tools.</returns>
    public IList<AITool> Tools() =>
    [
        AIFunctionFactory.Create(ListComponents, "listComponents"),
        AIFunctionFactory.Create(DescribeComponent, "describeComponent"),
        AIFunctionFactory.Create(ListTemplates, "listTemplates"),
        AIFunctionFactory.Create(DescribeTemplate, "describeTemplate"),
        AIFunctionFactory.Create(QueryDesignSystem, "queryDesignSystem"),
        AIFunctionFactory.Create(QueryModel, "queryModel"),
        AIFunctionFactory.Create(ListScreens, "listScreens"),
        AIFunctionFactory.Create(ReadScreen, "readScreen"),
        AIFunctionFactory.Create(ReadComments, "readComments"),
        AIFunctionFactory.Create(ReadStorylines, "readStorylines"),
        AIFunctionFactory.Create(WriteScreen, "writeScreen"),
        AIFunctionFactory.Create(ApplyOperations, "applyOperations"),
        AIFunctionFactory.Create(ProposeVariations, "proposeVariations"),
        AIFunctionFactory.Create(ProposeTweaks, "proposeTweaks"),
        AIFunctionFactory.Create(ProposeDesignSystemChange, "proposeDesignSystemChange"),
        AIFunctionFactory.Create(Finish, "finish"),
    ];

    static string Json(object value) => JsonSerializer.Serialize(value, _json);

    [Description("Lists the components of the catalogue: name, label, category and where each is placed. Narrow it with a category, with the screen template and outlet a component fits, or with a search.")]
    string ListComponents(
        [Description("The category of the components, such as Layout or Data.")] string? category = null,
        [Description("A screen template: lists only the components that fit one of its outlets.")] string? fitsTemplate = null,
        [Description("An outlet of that template: lists only the components that fit it.")] string? fitsOutlet = null,
        [Description("Text to find in a component's name, label or description.")] string? search = null) =>
        Answer(new DesignCatalogueQuery("components", Category: category, FitsTemplate: fitsTemplate, FitsOutlet: fitsOutlet, Search: search), "Looking at the components");

    [Description("Describes a component: its properties with the kind of each (text, number, boolean, choice with its choices, query, icon, destination, list), the outlets it fits and the parts, variants and states of its anatomy.")]
    string DescribeComponent([Description("The name of the component, as listComponents gives it.")] string name) =>
        Answer(new DesignCatalogueQuery("component", Name: name), $"Looking at {name}");

    [Description("Lists the screen templates of the catalogue with the outlets each has.")]
    string ListTemplates() => Answer(new DesignCatalogueQuery("templates"), "Looking at the screen templates");

    [Description("Describes a screen template: each outlet, what it accepts and how many it holds.")]
    string DescribeTemplate([Description("The name of the screen template.")] string name) =>
        Answer(new DesignCatalogueQuery("template", Name: name), $"Looking at the template {name}");

    [Description("Asks the design system: 'tokens' (optionally one category), 'token' (by address), 'designComponents' (the components of the design system with their variants), 'designComponent' (one, with its anatomy: parts, variants, states), 'themes', 'profile' (the keys of the ui profile and the values each allows) or 'words' (voice and naming).")]
    string QueryDesignSystem(
        [Description("What to ask: tokens, token, designComponents, designComponent, themes, profile or words.")] string what,
        [Description("The name of the design-system component, for designComponent.")] string? name = null,
        [Description("The category of the tokens, for tokens.")] string? category = null,
        [Description("The address of the token, for token, such as color.primary.")] string? address = null) =>
        Answer(new DesignCatalogueQuery(what, Category: category, Name: name, Address: address), "Looking at the design system");

    [Description("Asks about the application's model the screens are bound to: 'shapes' and 'shape' (the fields of one), 'queries' and 'query' (its result shape, fields and parameters), 'commands' and 'command' (its inputs).")]
    string QueryModel(
        [Description("What to ask: shapes, shape, queries, query, commands or command.")] string what,
        [Description("The name of the shape, query or command.")] string? name = null) =>
        Answer(new DesignCatalogueQuery(what, Name: name), "Looking at the model");

    [Description("Lists the screens (or screen templates) of the design in order with the template each is built on, and what the design is restricted to.")]
    string ListScreens()
    {
        progress?.Report(DesignTurnProgress.Status("Looking at the design"));
        var screens = workbench.Names.Select(name => new { name, template = TemplateOf(name) }).ToList();
        return Json(new
        {
            mode = workbench.Mode == Session.DesignMode.Templates ? "templates" : "screens",
            screens,
            templateSet = workbench.Context.Catalogue.TemplateSet,
            notes = workbench.Notes
        });
    }

    [Description("Reads a screen: its Screenplay text as it is now, and the elements an operation can address - id, component, outlet and properties.")]
    string ReadScreen([Description("The name of the screen, or of the screen template in template mode.")] string screen)
    {
        progress?.Report(DesignTurnProgress.Status($"Reading {screen}"));
        var text = workbench.TextOf(screen);
        return text is null
            ? Json(new { found = false, message = $"There is no screen named '{screen}'.", screens = workbench.Names })
            : Json(new { found = true, screen, text, elements = workbench.ElementsOf(screen) });
    }

    [Description("Reads the comments on the design: addressed to an element by its id, or loose on a screen. Resolved comments are marked.")]
    string ReadComments(
        [Description("Only the comments on this screen.")] string? screen = null,
        [Description("Only the comments on this element id.")] string? element = null)
    {
        progress?.Report(DesignTurnProgress.Status("Reading the comments"));
        return Json(new { comments = workbench.CommentsOn(screen, element) });
    }

    [Description("Reads the storylines of the design: the default one, which follows the screens in order, and the ones the author keeps.")]
    string ReadStorylines()
    {
        progress?.Report(DesignTurnProgress.Status("Reading the storylines"));
        return Json(new { storylines = workbench.Storylines() });
    }

    string Answer(DesignCatalogueQuery query, string status)
    {
        progress?.Report(DesignTurnProgress.Status(status));
        var answer = DesignCatalogueQueries.Answer(workbench.Context.Catalogue, query);
        return answer.Found
            ? Json(answer.Items is not null ? new { found = true, items = answer.Items } : new { found = true, item = answer.Item })
            : Json(new { found = false, message = $"The catalogue has no answer to '{query.What}'{(query.Name is null ? string.Empty : $" for '{query.Name}'")}. Ask for the list first." });
    }

    string TemplateOf(string name)
    {
        var target = DocumentLookup.ResolveTarget(workbench.Workspace.Document, workbench.Mode == Session.DesignMode.Templates ? null : name, workbench.Mode == Session.DesignMode.Templates ? name : null);
        return target is null ? string.Empty : DocumentLookup.Text(target.Value, "screenTemplate") ?? string.Empty;
    }
}
