// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type {
    FormSyntax, ScreenActionSyntax, ScreenDirectiveSyntax, ScreenSyntax, ScreenTemplateReferenceSyntax,
} from './Syntax/ScreenplaySyntax';
import type { JsonObject, JsonValue } from './json';
import { conversionFinding, type ConversionFinding } from './ConversionFinding';
import { elementsOf, isTypedDirective } from './sceneElementImport';
import { formToJson } from './sceneForms';
import { isBehaviorDirective } from './sceneBehaviors';
import { SceneScreenNames } from './sceneScreenNames';

export const contentSlot = 'content';
export const studioLayoutName = 'StudioScreen';

// The import half of SceneScreens.ToJson: one role's screens as the Scene document a host draws.
//
// What it writes is a document to *draw*, not one to export back to Screenplay. The C# bridge additionally keeps
// every directive no Scene element can hold as printed .play text in the document's native residue, so the exact
// document round-trips; printing .play is a C#-only ability, so this bridge reports such a directive as a finding
// instead. A document from here therefore draws the same screen and is not a substitute for the C# bridge's own.
export interface ScreenDocumentConversion {
    readonly document: JsonObject;
    readonly findings: readonly ConversionFinding[];
}

export const screensToDocument = (
    role: string,
    screens: readonly ScreenSyntax[],
    forms: readonly FormSyntax[],
    verbatim: boolean): ScreenDocumentConversion => {
    const names = verbatim
        ? SceneScreenNames.ofOwnScreens(screens.map(screen => screen.name))
        : SceneScreenNames.forScreenplay(role, screens.map(screen => screen.name));
    const findings: ConversionFinding[] = [];
    const document: JsonObject = {
        layouts: [],
        screenTemplates: [],
        dialogTemplates: [],
        screens: screens.map(screen => screenToJson(screen, forms, names, findings) as JsonValue),
        exposures: [],
        instanceContributions: [],
    };

    return { document, findings };
};

const screenToJson = (screen: ScreenSyntax, moduleForms: readonly FormSyntax[], names: SceneScreenNames, findings: ConversionFinding[]): JsonObject => {
    const template = screen.directives.find(directive => directive.kind === 'ScreenTemplateReferenceSyntax') as ScreenTemplateReferenceSyntax | undefined;
    const directives = template ? template.slots.flatMap(slot => slot.directives) : screen.directives;
    const commands = new Set(directives.filter(directive => directive.kind === 'ScreenActionSyntax').map(directive => (directive as ScreenActionSyntax).command));
    const forms = moduleForms.filter(form => commands.has(form.for));
    const formCommands = new Set(forms.map(form => form.for));
    // An action whose command a form of the module already states is that form; the element would say it twice.
    const content = (held: readonly ScreenDirectiveSyntax[]) =>
        held.filter(directive => directive.kind !== 'ScreenActionSyntax' || !formCommands.has((directive as ScreenActionSyntax).command));

    report(screen, template, findings);

    const json: JsonObject = {
        name: names.toScene(screen.name),
        layout: studioLayoutName,
        slotContent: template
            ? Object.fromEntries(template.slots.map(slot => [slot.name, elementsOf(content(slot.directives), names) as JsonValue]))
            : { [contentSlot]: elementsOf(content(screen.directives), names) as JsonValue },
        forms: forms.map(form => formToJson(form) as JsonValue),
        contributions: [],
    };

    // Which blueprint package the template came from is residue the C# bridge keeps so an export writes the same
    // reference again; it changes nothing a host draws, and only that bridge can produce residue, so it is left out.
    if (template) json.screenTemplate = template.name;

    return json;
};

// Everything the screen said that is not in the document, named once per screen so a host can say why a screen
// looks thinner than the .play reads.
const report = (screen: ScreenSyntax, template: ScreenTemplateReferenceSyntax | undefined, findings: ConversionFinding[]): void => {
    const directives = template ? [...screen.directives.filter(directive => directive !== template), ...template.slots.flatMap(slot => slot.directives)] : screen.directives;
    const unconverted = new Set<string>();
    for (const directive of directives) {
        if (isTypedDirective(directive)) continue;
        if (isBehaviorDirective(directive)) {
            unconverted.add('an interaction');
            continue;
        }
        unconverted.add(describe(directive));
    }

    for (const what of [...unconverted].sort()) {
        findings.push(conversionFinding(screen.name, `${what} is drawn by Studio but is not carried into the screen this board draws`));
    }
};

const descriptions: Readonly<Record<string, string>> = {
    ScreenNavigateSyntax: 'a navigation',
    ScreenShowSyntax: 'a nested screen',
    ScreenGuardedActionSyntax: 'a guarded action',
    ScreenCodeSyntax: 'an inline code block',
    ScreenTableSyntax: 'a table that navigates on row click',
    ScreenToolbarSyntax: 'a toolbar of items rather than buttons',
    ScreenDataSyntax: 'an optional data binding',
    ScreenTemplateReferenceSyntax: 'a second template reference',
};

const describe = (directive: ScreenDirectiveSyntax): string => descriptions[directive.kind] ?? `a '${directive.kind}' directive`;
