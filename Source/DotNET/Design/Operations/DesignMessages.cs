// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// The words of every refusal and summary. Both engines use the same text, so what a tool reads does not depend on the language.
/// </summary>
#pragma warning disable SA1600, SA1611, SA1615 // The method names say what each message is about; the texts are shared with the TypeScript package.
internal static class DesignMessages
{
    public const string TargetMissing = "Name exactly one of a screen and a template to change.";
    public const string NoLayout = "The document has no layout to put a screen in.";
    public const string NoProfile = "The design has no UI profile to change.";
    public const string SlotNameMissing = "A slot has a name.";
    public const string RefusedByDefault = "The request is outside what the design system offers.";

    public static string EditUnknown(string op) => $"The operation '{op}' is not one a design knows.";

    public static string ScreenUnknown(string name) => $"There is no screen named '{name}'.";

    public static string ScreenExists(string name) => $"A screen named '{name}' already exists.";

    public static string TemplateUnknown(string name) => $"There is no screen template named '{name}' in the design.";

    public static string TemplateExists(string name) => $"A screen template named '{name}' already exists.";

    public static string TemplateNotInCatalogue(string name, IEnumerable<string> names) => $"The template '{name}' is not in the catalogue. Templates: {List(names)}.";

    public static string TemplateNotInSet(string name, IEnumerable<string> set) => $"The template '{name}' is outside the templates this design may use: {List(set)}.";

    public static string ElementUnknown(string id) => $"There is no element '{id}' there.";

    public static string ElementIdTaken(string id) => $"The id '{id}' is already used in the document.";

    public static string ComponentNotInCatalogue(string name) => $"The component '{name}' is not in the catalogue.";

    public static string OverlayNeedsAction(string label) => $"{label} is an overlay: it opens from an action and is not placed in an outlet.";

    public static string ShellComponent(string label) => $"{label} belongs to the root template and is not placed on a screen.";

    public static string OutletUnknown(string target, string outlet, IReadOnlyList<string> homes) =>
        $"'{target}' has no outlet '{outlet}'.{(homes.Count > 0 ? $" It takes this in: {List(homes)}." : string.Empty)}";

    public static string OutletDoesNotAccept(string outlet, string label, IReadOnlyList<string> homes) =>
        $"The outlet '{outlet}' does not take {label}.{(homes.Count > 0 ? $" It fits: {List(homes)}." : string.Empty)}";

    public static string OutletFull(string outlet, int max) => $"The outlet '{outlet}' holds at most {max}.";

    public static string PropertyUnknown(string component, string prop, IEnumerable<string> names) => $"{component} has no property '{prop}'. Properties: {List(names)}.";

    public static string ValueNotAllowed(string prop, string expected) => $"'{prop}' {expected}.";

    public static string VariantNotInDesignSystem(string component, string value, IEnumerable<string> variants) =>
        $"The design system has no '{value}' variant of {component}. Variants: {List(variants)}.";

    public static string QueryUnknown(string name, IEnumerable<string> names) => $"There is no query '{name}'. Queries: {List(names)}.";

    public static string DestinationUnknown(string name) => $"There is no screen '{name}' to navigate to.";

    public static string NoDestinationProperty(string component) => $"{component} has no property that navigates.";

    public static string FreeStyling(string prop) => $"'{prop}' is free styling. A design uses the components, variants and tokens of the design system.";

    public static string OffSystem(string value) => $"'{value}' is a value of its own. A design uses the tokens and variants of the design system.";

    public static string ProfileKeyUnknown(string key) => $"'{key}' is not a key of the profile a design changes.";

    public static string ProfileValueNotAllowed(string key, string value, IReadOnlyList<string> allowed) =>
        $"'{value}' is not a value of {key}.{(allowed.Count > 0 ? $" Allowed: {List(allowed)}." : string.Empty)}";

    public static string SlotExists(string template, string slot) => $"The template '{template}' already has a slot '{slot}'.";

    public static string SlotUnknown(string template, string slot) => $"The template '{template}' has no slot '{slot}'.";

    public static string SlotInUse(string template, string slot) => $"The slot '{slot}' of '{template}' is still placed by its arrangement.";

    public static string ArrangementInvalid(string slot) => $"The arrangement places the slot '{slot}', which the template does not have.";

    public static string TooManyTemplates(int max) => $"Variations offer at most {max} templates.";

    public static string TooManyControls(int max) => $"A design offers at most {max} tweak controls.";

    public static string TweakUnresolved(string label) => $"The tweak '{label}' is bound to nothing the design has, or to something that is not a choice.";

    public static string AddedScreen(string name, string template) => $"Added screen {name} on {template}";

    public static string RemovedScreen(string name) => $"Removed screen {name}";

    public static string MovedScreen(string name, int index) => $"Moved screen {name} to position {index}";

    public static string AddedTemplate(string name) => $"Added template {name}";

    public static string AddedSlot(string template, string slot) => $"Added slot {slot} to {template}";

    public static string RemovedSlot(string template, string slot) => $"Removed slot {slot} from {template}";

    public static string Arranged(string template) => $"Arranged the slots of {template}";

    public static string AddedComponent(string label, string outlet) => $"Added {label} to {outlet}";

    public static string SetProperty(string prop, string label) => $"Set {prop} of {label}";

    public static string RemovedElement(string id) => $"Removed {id}";

    public static string MovedElement(string id, string outlet) => $"Moved {id} to {outlet}";

    public static string Linked(string id, string to) => $"{id} navigates to {to}";

    public static string ChangedProfile(string key) => $"Changed {key}";

    public static string VariationsOffered(int count, string screen) => $"{count} {(count == 1 ? "variation" : "variations")} of {screen}";

    public static string TweaksOffered(int count) => $"{count} {(count == 1 ? "tweak control" : "tweak controls")}";

    public static string NotCarriedOver(string element, string template) => $"{element} has no outlet on {template} that takes it";

    public static string DanglingLink(string element, string screen) => $"{element} navigates to {screen}, which is no longer in the design";

    static string List(IEnumerable<string> names) => string.Join(", ", names);
}
