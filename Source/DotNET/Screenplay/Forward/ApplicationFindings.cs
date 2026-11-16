// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Navigation;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Engine.Toolbar;
using SceneToolbar = Cratis.Scene.Model.Toolbar;

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// The findings that hold for a converted <see cref="SceneApplication"/> on its own, whatever it is rendered for.
/// </summary>
public static class ApplicationFindings
{
    /// <summary>
    /// States what Scene's structure, navigation and toolbar validation found in the application as a whole.
    /// </summary>
    /// <param name="application">The translated <see cref="SceneApplication"/>.</param>
    /// <returns>The findings, if any.</returns>
    /// <remarks>
    /// The rules are Scene's: <c language="csharp">NavigationOutletDiagnostics</c> and <c language="csharp">ToolbarButtonValidation</c> run unmodified over the
    /// <see cref="SceneApplication.Structure"/> built from the compiled model, so a finding here is the one the designer reports.
    /// The slot names a navigation item may render into are the slots of the layouts the document declares.
    /// </remarks>
    public static IEnumerable<ConversionFinding> ForApplication(SceneApplication application)
    {
        var index = new ApplicationStructureIndex(application.Structure);
        foreach (var diagnostic in index.Diagnostics)
        {
            yield return new ConversionFinding(ConversionFindingKind.StructureInvalid, string.Empty, $"{diagnostic.Code}: {diagnostic.Message}");
        }

        var slots = application.Layouts.SelectMany(layout => layout.Slots.Select(slot => slot.Name)).Distinct(StringComparer.Ordinal).ToList();
        foreach (var diagnostic in NavigationOutletDiagnostics.Diagnose(index, application.Navigation, slots))
        {
            yield return new ConversionFinding(ConversionFindingKind.NavigationInvalid, diagnostic.Entry ?? string.Empty, $"{diagnostic.Code}: {diagnostic.Message}");
        }

        foreach (var finding in SampleDataConverter.Validate(application))
        {
            yield return finding;
        }

        // A hook button names a slice; a button that names no slice, command, destination or built-in does nothing, which the
        // engine's validation reports.
        var buttons = application.OutletButtons()
            .Where(button => button.BuiltIn is null && button.Command is null && button.NavigateTo is null)
            .Select(button => new SceneToolbar.ToolbarButton(button.Id, button.Title, button.Slice, button.Emphasis, button.Icon))
            .ToList();
        foreach (var diagnostic in ToolbarButtonValidation.Validate(index, new SceneToolbar.Toolbar(buttons)))
        {
            yield return new ConversionFinding(ConversionFindingKind.ToolbarButtonInvalid, diagnostic.Button, $"{diagnostic.Code}: {diagnostic.Message}");
        }
    }
}
