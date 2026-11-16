// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout, ScreenTemplate, DialogTemplate } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { ResolvedUiProfile } from '../UiProfile/ResolvedUiProfile';
import { ApplicationTemplate } from './ApplicationTemplate';
import { TemplateCandidate } from './TemplateCandidate';
import { TemplateCatalog } from './TemplateCatalog';
import { TemplateReferenceKind } from './TemplateReferenceKind';
import { ownTemplateSource } from './ownTemplateSource';
import { toTemplateSources } from './toTemplateSources';

/**
 * Collects every template that can be chosen for an application: the ones the packages of its UI Profile
 * provide, and the ones built for the application itself.
 *
 * Packages are read in the profile's override order, so a later package's template replaces an earlier one
 * of the same name - the same rule the rest of the profile follows.
 *
 * @param resolved The resolved UI Profile.
 * @param bundles Every known package bundle.
 * @param applicationTemplates The templates built for the application.
 * @returns The {@link TemplateCatalog}.
 */
export function buildTemplateCatalog(resolved: ResolvedUiProfile, bundles: ScenePackageBundle[], applicationTemplates: ApplicationTemplate[] = []): TemplateCatalog {
    const contributing = resolved.selection.packages.flatMap(name => bundles.filter(bundle => bundle.manifest.name === name));
    const screens = new Map<string, TemplateCandidate>();
    const dialogs = new Map<string, TemplateCandidate>();
    const layouts = new Map<string, Layout>();

    for (const bundle of contributing) {
        for (const layout of bundle.layouts ?? []) layouts.set(layout.name, layout);
        for (const template of bundle.screenTemplates ?? []) {
            screens.set(template.name, blueprintCandidate(template, bundle.manifest.name));
        }
        for (const template of bundle.dialogTemplates ?? []) {
            dialogs.set(template.name, dialogCandidate(template, bundle.manifest.name));
        }
    }

    return {
        layout: layouts.get(resolved.layout),
        blueprint: [...screens.values()],
        dialog: [...dialogs.values()],
        application: applicationTemplates.map(template => ({
            reference: { kind: TemplateReferenceKind.Application, id: template.id },
            displayName: template.name,
            source: '',
        })),
        library: { own: ownTemplateSource(applicationTemplates), blueprints: toTemplateSources(contributing) },
    };
}

function blueprintCandidate(template: ScreenTemplate, source: string): TemplateCandidate {
    return {
        reference: { kind: TemplateReferenceKind.Blueprint, id: template.name },
        displayName: template.displayName ?? template.name,
        description: template.description,
        source,
        template,
    };
}

function dialogCandidate(template: DialogTemplate, source: string): TemplateCandidate {
    return {
        reference: { kind: TemplateReferenceKind.Blueprint, id: template.name },
        displayName: template.displayName ?? template.name,
        description: template.description,
        source,
        dialogTemplate: template,
    };
}
