// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext, useMemo } from 'react';
import type { ApplicableTemplate } from '@cratis/scene.engine';
import type { PropertyEditorProps } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorProps';
import { TemplatePicker } from '../../TemplatePicker';
import type { TemplatePickerLabels } from '../../TemplatePicker/TemplatePickerLabels';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import type { TemplateCatalog } from '../../ScreenTemplates/TemplateCatalog';
import { TemplateLevel } from '../../ScreenTemplates/TemplateLevel';
import { applicableTemplatesAt } from '../../ScreenTemplates/applicableTemplatesAt';
import { findTemplateCandidate } from '../../ScreenTemplates/findTemplateCandidate';
import { formatTemplateReference } from '../../ScreenTemplates/formatTemplateReference';
import { parseTemplateReference } from '../../ScreenTemplates/parseTemplateReference';
import { referenceOfApplicableTemplate } from '../../ScreenTemplates/referenceOfApplicableTemplate';

// What the template editor of the designer chooses among: the templates the profile's packages and the application offer at application level,
// and the words that name a choice that is none, or no longer there.
export interface ProfileTemplates {
    catalog: TemplateCatalog;
    labels: TemplatePickerLabels;
    none: string;
    unavailable: (name: string) => string;
    applicationTemplate: (name: string) => string;
}

export const ProfileTemplatesContext = createContext<ProfileTemplates | undefined>(undefined);

// The `template` property editor of the designer. The screen editor's one chooses a template for an element of the document being edited; the
// profile has no document, so this one reads the profile's own catalog and stores the reference the profile keeps (`own:<id>` / `blueprint:<name>`).
export const ProfileTemplateEditor = ({ value, onChange, disabled, id }: PropertyEditorProps<string>) => {
    const templates = useContext(ProfileTemplatesContext);
    const stored = typeof value === 'string' ? value : '';
    const current = useMemo(() => parseTemplateReference(stored), [stored]);
    const applicable = useMemo(
        () => templates ? applicableTemplatesAt({ level: TemplateLevel.Application, chain: [], reference: current }, templates.catalog) : undefined,
        [templates, current]);
    if (!templates || !applicable) return <output id={id}>{stored}</output>;

    const candidate = current ? findTemplateCandidate(templates.catalog, current) : undefined;
    const currentLabel = !current
        ? templates.none
        : !candidate
            ? templates.unavailable(stored)
            : current.kind === TemplateReferenceKind.Application ? templates.applicationTemplate(candidate.displayName) : candidate.displayName;
    const handlers = {
        onChoose: (template: ApplicableTemplate) => onChange(formatTemplateReference(referenceOfApplicableTemplate(template))),
        onClear: current ? () => onChange('') : undefined,
    };

    return <TemplatePicker ariaLabel={`${templates.labels.menu}: ${currentLabel}`} applicable={applicable} current={current} currentLabel={currentLabel} labels={templates.labels} handlers={handlers} disabled={disabled} />;
};
