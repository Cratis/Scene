// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Why an operation was refused, in the codes a tool or a canvas can act on.
/// </summary>
public static class DesignRefusalCode
{
    /// <summary>The operation is not one a design knows.</summary>
    public const string EditUnknown = "editUnknown";

    /// <summary>The operation names both or neither of a screen and a template.</summary>
    public const string TargetMissing = "targetMissing";

    /// <summary>There is no such screen.</summary>
    public const string ScreenUnknown = "screenUnknown";

    /// <summary>A screen of that name exists.</summary>
    public const string ScreenExists = "screenExists";

    /// <summary>There is no such screen template in the design.</summary>
    public const string TemplateUnknown = "templateUnknown";

    /// <summary>A screen template of that name exists.</summary>
    public const string TemplateExists = "templateExists";

    /// <summary>The template is not in the catalogue.</summary>
    public const string TemplateNotInCatalogue = "templateNotInCatalogue";

    /// <summary>The template is outside the set the design may use.</summary>
    public const string TemplateNotInSet = "templateNotInSet";

    /// <summary>The document has no layout to put a screen in.</summary>
    public const string NoLayout = "noLayout";

    /// <summary>There is no such element.</summary>
    public const string ElementUnknown = "elementUnknown";

    /// <summary>The element id is used in the document.</summary>
    public const string ElementIdTaken = "elementIdTaken";

    /// <summary>The component is not in the catalogue.</summary>
    public const string ComponentNotInCatalogue = "componentNotInCatalogue";

    /// <summary>An overlay opens from an action and is not placed in an outlet.</summary>
    public const string OverlayNeedsAction = "overlayNeedsAction";

    /// <summary>A shell component belongs to the root template.</summary>
    public const string ShellComponent = "shellComponent";

    /// <summary>The target has no such outlet.</summary>
    public const string OutletUnknown = "outletUnknown";

    /// <summary>The outlet does not take the component.</summary>
    public const string OutletDoesNotAccept = "outletDoesNotAccept";

    /// <summary>The outlet holds no more.</summary>
    public const string OutletFull = "outletFull";

    /// <summary>The component has no such property.</summary>
    public const string PropertyUnknown = "propertyUnknown";

    /// <summary>The property does not take the value.</summary>
    public const string ValueNotAllowed = "valueNotAllowed";

    /// <summary>The design system declares no such variant.</summary>
    public const string VariantNotInDesignSystem = "variantNotInDesignSystem";

    /// <summary>There is no such query.</summary>
    public const string QueryUnknown = "queryUnknown";

    /// <summary>There is no screen to navigate to.</summary>
    public const string DestinationUnknown = "destinationUnknown";

    /// <summary>The component has no property that navigates.</summary>
    public const string NoDestinationProperty = "noDestinationProperty";

    /// <summary>The property is free styling.</summary>
    public const string FreeStylingNotAllowed = "freeStylingNotAllowed";

    /// <summary>The value is one of its own, not the design system's.</summary>
    public const string OffSystemValue = "offSystemValue";

    /// <summary>The design has no profile.</summary>
    public const string NoProfile = "noProfile";

    /// <summary>The key is not one of the profile a design changes.</summary>
    public const string ProfileKeyUnknown = "profileKeyUnknown";

    /// <summary>The key does not take the value.</summary>
    public const string ProfileValueNotAllowed = "profileValueNotAllowed";

    /// <summary>The template has the slot.</summary>
    public const string SlotExists = "slotExists";

    /// <summary>The template has no such slot.</summary>
    public const string SlotUnknown = "slotUnknown";

    /// <summary>The arrangement places the slot.</summary>
    public const string SlotInUse = "slotInUse";

    /// <summary>The arrangement places a slot the template lacks.</summary>
    public const string ArrangementInvalid = "arrangementInvalid";

    /// <summary>Variations offer fewer templates.</summary>
    public const string TooManyTemplates = "tooManyTemplates";

    /// <summary>A design offers fewer tweak controls.</summary>
    public const string TooManyControls = "tooManyControls";

    /// <summary>The tweak is bound to nothing the design has.</summary>
    public const string TweakUnresolved = "tweakUnresolved";

    /// <summary>The Scene engine refused the edit.</summary>
    public const string SceneRefused = "sceneRefused";
}
