// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FaGripVertical } from 'react-icons/fa';
import { setElementDrag } from './dragPayload';

export interface SelectionGripProps {
    left: number;
    top: number;
    elementId: string;
    name: string;
    title: string;
    onStart: (elementId: string) => void;
    onEnd: () => void;
}

export const SelectionGrip = ({ left, top, elementId, name, title, onStart, onEnd }: SelectionGripProps) => (
    <div
        className='studio-screen-surface__grip'
        style={{ left, top: Math.max(0, top - 22) }}
        draggable
        aria-hidden='true'
        title={title}
        onDragStart={event => { onStart(elementId); setElementDrag(event, elementId, name); }}
        onDragEnd={onEnd}>
        <FaGripVertical aria-hidden='true' />
    </div>
);
