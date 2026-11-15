// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type ApplicationStructure, type OutletItem, type SceneElement, type Toolbar, type ToolbarButton } from '@cratis/scene.model';
import { ApplicationStructureIndex, outletActionAsToolbarButton, toolbarButtonFromItem, validateToolbarButtons, ToolbarDiagnosticSeverity } from '@cratis/scene.engine';

export interface ToolbarFinding {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    button: string;
}

const componentNameOf = (element: SceneElement): string => String((element as unknown as { componentName?: string }).componentName ?? '');
const propertiesOf = (element: SceneElement): Record<string, unknown> => (element as unknown as { properties?: Record<string, unknown> }).properties ?? {};

// Whether an element is a toolbar: an outlet of actions drawn where the screen places it (`core:outletItems`, Scene 5), or the toolbar element a document
// not yet read through Scene's upgrader still has.
export function isToolbarElement(element: SceneElement): boolean {
    const name = componentNameOf(element);
    if (/(^|:)toolbar$/.test(name)) return true;
    return /(^|:)outletItems$/.test(name) && (propertiesOf(element).kind ?? 'actions') === 'actions';
}

// The buttons of a toolbar as the toolbar rules read them: the actions of an outlet's `items`, or the `core:toolbarItem` elements of a legacy toolbar.
export function toolbarButtonsOf(toolbar: SceneElement): ToolbarButton[] {
    if (/(^|:)outletItems$/.test(componentNameOf(toolbar))) {
        const items = propertiesOf(toolbar).items;
        return (Array.isArray(items) ? items as OutletItem[] : [])
            .filter(item => item.kind === OutletItemKind.Button)
            .flatMap(item => {
                const button = outletActionAsToolbarButton(item as never);
                return button ? [button] : [];
            });
    }

    const elements = (toolbar as unknown as { slots?: Record<string, SceneElement[]> }).slots?.items ?? [];
    return elements.flatMap(item => {
        const { id, properties } = item as unknown as { id: string; properties: Record<string, unknown> };
        const button = toolbarButtonFromItem(id, properties);
        return button ? [button] : [];
    });
}

// Scene's findings about the buttons of a toolbar (TB5) - no slice (a warning: allowed while authoring), a slice that is gone, one that is not a State Change -
// with each button named by its title, the way the author knows it.
export function toolbarDiagnostics(structure: ApplicationStructure, toolbar: SceneElement): ToolbarFinding[] {
    return diagnosticsOf(structure, toolbarButtonsOf(toolbar));
}

// Scene's findings about one button of a toolbar, worded as the toolbar lists them.
export function buttonDiagnostics(structure: ApplicationStructure, button: ToolbarButton): ToolbarFinding[] {
    return diagnosticsOf(structure, [button]);
}

function diagnosticsOf(structure: ApplicationStructure, buttons: ToolbarButton[]): ToolbarFinding[] {
    if (buttons.length === 0) return [];
    const titles = new Map(buttons.map(button => [button.id, button.title]));
    const model = { buttons } as Toolbar;
    return validateToolbarButtons(new ApplicationStructureIndex(structure), model).map(finding => ({
        code: finding.code,
        severity: finding.severity === ToolbarDiagnosticSeverity.Error ? 'error' as const : 'warning' as const,
        message: finding.message.replace(`'${finding.button}'`, `'${titles.get(finding.button) ?? finding.button}'`),
        button: finding.button,
    }));
}
