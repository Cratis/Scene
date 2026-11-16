// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateSource } from '@cratis/scene.engine';

/** What a package contributes to the template library: its manifest and the templates and layouts it carries. */
export interface TemplateSourceBundle {
    manifest: TemplateSource['manifest'];
    layouts?: TemplateSource['layouts'];
    screenTemplates?: TemplateSource['screenTemplates'];
    dialogTemplates?: TemplateSource['dialogTemplates'];
}

/**
 * The packages as Scene's template library reads them, in the order given.
 *
 * A later package's template replaces an earlier one of the same name - the rule the whole UI Profile follows - so
 * each source keeps only the templates that win, and the picker never lists the same name twice.
 *
 * @param bundles The packages, in ascending override priority.
 * @returns The template sources.
 */
export function toTemplateSources(bundles: readonly TemplateSourceBundle[]): TemplateSource[] {
    const winner = { screen: new Map<string, string>(), dialog: new Map<string, string>() };
    for (const bundle of bundles) {
        for (const template of bundle.screenTemplates ?? []) winner.screen.set(template.name, bundle.manifest.name);
        for (const template of bundle.dialogTemplates ?? []) winner.dialog.set(template.name, bundle.manifest.name);
    }

    return bundles.map(bundle => ({
        manifest: bundle.manifest,
        layouts: bundle.layouts,
        screenTemplates: bundle.screenTemplates?.filter(template => winner.screen.get(template.name) === bundle.manifest.name),
        dialogTemplates: bundle.dialogTemplates?.filter(template => winner.dialog.get(template.name) === bundle.manifest.name),
    }));
}
