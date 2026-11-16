// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Queries;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// Everything the catalogue is built from. Only the descriptors and templates are required; whatever else the host has - a design system, themes, a profile,
/// shapes, queries, commands and sample data - grounds the design further.
/// </summary>
/// <param name="Descriptors">The component descriptors of the profile's packages.</param>
/// <param name="Templates">The screen templates as Scene JSON, including root templates (those whose metadata role is Root) that only a profile uses.</param>
/// <param name="DesignSystem">The design system.</param>
/// <param name="Themes">Flat themes the profile's packages ship, besides the design system's own.</param>
/// <param name="Profile">The UI profile.</param>
/// <param name="OutletRules">What each outlet takes, by template name and then outlet name.</param>
/// <param name="ShellComponents">Components that belong to the root template, which a screen never places.</param>
/// <param name="Fonts">The fonts the profile may name.</param>
/// <param name="Shapes">The shapes the host declares.</param>
/// <param name="Queries">The queries.</param>
/// <param name="Commands">The commands.</param>
/// <param name="SampleData">The sample-data shapes.</param>
/// <param name="TemplateSet">The templates a session may use. When given, the catalogue lists only these and anything else is refused.</param>
public record DesignCatalogueInput(
    IReadOnlyList<ComponentDescriptor> Descriptors,
    IReadOnlyList<JsonElement> Templates,
    DesignSystem? DesignSystem = null,
    IReadOnlyList<Theme>? Themes = null,
    UiProfile? Profile = null,
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, DesignOutletRuleInput>>? OutletRules = null,
    IReadOnlyList<string>? ShellComponents = null,
    IReadOnlyList<string>? Fonts = null,
    IReadOnlyList<DesignShape>? Shapes = null,
    IReadOnlyList<QueryCandidate>? Queries = null,
    IReadOnlyList<DesignCommand>? Commands = null,
    IReadOnlyList<SampleShape>? SampleData = null,
    IReadOnlyList<string>? TemplateSet = null);
