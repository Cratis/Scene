// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';
import { outletNamesOfTemplate, templateSchematic } from '../State/templateSchematic';
import './TemplateSchematic.css';

export interface TemplateSchematicProps {
    template: ScreenTemplate;
}

/**
 * A screen template as the canvas shows it: its slots where its arrangement puts them, each named and marked as primary or optional, and under
 * them the item outlets it offers. A screen is filled into the slots; the schematic is the picture of what a screen on this template has room for.
 */
export const TemplateSchematic = ({ template }: TemplateSchematicProps) => {
    const boxes = templateSchematic(template);
    const outlets = outletNamesOfTemplate(template);
    return (
        <div className='template-schematic' role='img' aria-label={`Template ${template.displayName ?? template.name}`}>
            <div className='template-schematic__slots'>
                {boxes.length === 0 && <div className='template-schematic__none'>This template has no slots yet.</div>}
                {boxes.map(({ slot, x, y, width, height }) => (
                    <div
                        key={slot.name}
                        className={`template-schematic__slot${slot.primary === true ? ' template-schematic__slot--primary' : ''}${slot.optional === true ? ' template-schematic__slot--optional' : ''}`}
                        style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
                        data-slot={slot.name}>
                        <span className='template-schematic__name'>{slot.name}</span>
                        {slot.primary === true && <span className='template-schematic__flag'>primary</span>}
                        {slot.optional === true && <span className='template-schematic__flag'>optional</span>}
                        {slot.description !== undefined && <span className='template-schematic__description'>{slot.description}</span>}
                    </div>
                ))}
            </div>
            {outlets.length > 0 && (
                <ul className='template-schematic__outlets' aria-label='Outlets'>
                    {outlets.map(outlet => <li key={outlet} data-outlet={outlet}>{outlet}</li>)}
                </ul>
            )}
        </div>
    );
};
