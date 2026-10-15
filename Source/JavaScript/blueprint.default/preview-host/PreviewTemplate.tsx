// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import type { FlowArrangement } from '@cratis/scene.model';
import { evaluateFlowArrangement } from '@cratis/scene.engine';
import type { ComponentRegistry, RegisteredComponentProps } from '@cratis/scene.react';
import { FlowArrangementView } from './FlowArrangementView';
import { useSizeClass } from './useSizeClass';

/** The name the template wrapper is registered under. */
export const previewTemplateComponent = 'Scene:template';

function isFlowArrangement(arrangement: unknown): arrangement is FlowArrangement {
    return !!arrangement && typeof arrangement === 'object' && 'root' in arrangement;
}

/**
 * A screen's content inside the screen template it names.
 *
 * The template's own `arrangement flow` positions its slots - header, body, aside - exactly as the document wrote it, evaluated
 * for the window's current size class. A template with no flow arrangement stacks them. It sits inside the shell's content
 * slot, so the shell, not this, owns the chrome around it. Stage and the preview host render templates with this one component.
 */
export function PreviewTemplate({ element, slots }: RegisteredComponentProps) {
    const sizeClass = useSizeClass();
    const arrangement = (element.properties as Record<string, unknown> | undefined)?.arrangement;
    const nodes: Record<string, ReactNode> = {};
    for (const [name, content] of Object.entries(slots)) {
        nodes[name] = <section className='scene-template-slot' data-slot={name}>{content}</section>;
    }

    return (
        <div className='scene-template' data-scene-id={element.id}>
            {isFlowArrangement(arrangement)
                ? <FlowArrangementView node={evaluateFlowArrangement(arrangement, sizeClass)} slots={nodes} />
                : Object.entries(nodes).map(([name, node]) => <div key={name}>{node}</div>)}
        </div>
    );
}

/** The components the preview host and the Stage add to the registry for composed screens. */
export const previewComponents: ComponentRegistry = {
    [previewTemplateComponent]: PreviewTemplate,
};
