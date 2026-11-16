// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { applicableTemplates, type ApplicableTemplate } from '@cratis/scene.engine';
import { screenTemplateTarget } from '../../Templates/screenTemplateTarget';
import { TemplateReferenceKind } from '../../../ScreenTemplates/TemplateReferenceKind';
import { toTemplateSources } from '../../../ScreenTemplates/toTemplateSources';
import { TemplatePicker } from '../../../TemplatePicker';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// The `template` property editor (spec 8.2): the one TemplatePicker, offering what Scene says applies where the screen sits, with the
// template named by the stored value checked. The value is the template's name; one no package provides any more is shown as it is stored,
// never dropped. It needs the editing session for the packages in play; without one there is nothing to offer and the value is shown as stored.
export const TemplatePropertyEditor = ({ value, onChange, context, disabled, id }: PropertyEditorProps<string>) => {
    const environment = context.session?.environment;
    const labels = context.session?.screenStrings.properties.templates.picker;
    const bundles = environment?.runtime.bundles;
    const profile = environment?.runtime.profile;
    const scope = environment?.templateScope;
    const applicable = useMemo(
        () => applicableTemplates({ blueprints: toTemplateSources(bundles ?? []) }, screenTemplateTarget({ bundles: bundles ?? [], profile: profile ?? {}, scope })),
        [bundles, profile, scope]);
    const stored = typeof value === 'string' && value !== '' ? value : undefined;
    if (!labels) return <output id={id}>{stored ?? ''}</output>;

    const known = bundles?.flatMap(bundle => [...(bundle.screenTemplates ?? []), ...(bundle.dialogTemplates ?? [])]).find(template => template.name === stored);
    const handlers = {
        onChoose: (template: ApplicableTemplate) => onChange(template.name),
        onClear: stored ? () => onChange(undefined) : undefined,
    };

    return (
        <TemplatePicker
            ariaLabel={labels.menu}
            applicable={applicable}
            current={stored ? { kind: TemplateReferenceKind.Blueprint, id: stored } : undefined}
            currentLabel={stored ? known?.displayName ?? stored : undefined}
            labels={labels}
            handlers={handlers}
            disabled={disabled}
        />
    );
};
