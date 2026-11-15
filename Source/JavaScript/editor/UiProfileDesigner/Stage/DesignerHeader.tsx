// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FaDesktop, FaMobileAlt, FaRedo, FaUndo } from 'react-icons/fa';
import { IconButton } from '@cratis/components/Common';
import { formatMessage } from '../../UiProfile/formatMessage';
import { SaveState } from '../Autosave/SaveState';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export type Device = 'desktop' | 'mobile';

export interface DesignerHeaderProps {
    applicationName: string;
    strings: UiProfileDesignerStrings;
    saveState: SaveState;
    onRetry?: () => void;

    /** The name of the edit undo would take back; absent when there is nothing to undo. */
    undoLabel?: string;
    redoLabel?: string;
    onUndo: () => void;
    onRedo: () => void;

    device: Device;
    onDevice: (device: Device) => void;
}

/** The header: what is being designed, the named undo and redo, whether the work is saved, and the device the preview is shown as. */
export const DesignerHeader = ({ applicationName, strings, saveState, onRetry, undoLabel, redoLabel, onUndo, onRedo, device, onDevice }: DesignerHeaderProps) => {
    const text = strings.editor.header;
    const saved = { [SaveState.Saved]: text.saved, [SaveState.Pending]: text.pending, [SaveState.Saving]: text.saving, [SaveState.Failed]: text.failed }[saveState];
    const undoText = undoLabel === undefined ? text.undo : formatMessage(text.undoNamed, { label: undoLabel });
    const redoText = redoLabel === undefined ? text.redo : formatMessage(text.redoNamed, { label: redoLabel });
    return (
        <header className='studio-designer-header'>
            <h1 className='studio-designer-header__title'>{formatMessage(strings.windowTitle, { application: applicationName })}</h1>
            <div className='studio-designer-header__actions' role='toolbar' aria-label={strings.windowLabel}>
                <IconButton icon={<FaUndo aria-hidden='true' />} aria-label={undoText} title={`${undoText} (Ctrl+Z)`} variant='ghost' size='small' disabled={undoLabel === undefined} onClick={onUndo} />
                <IconButton icon={<FaRedo aria-hidden='true' />} aria-label={redoText} title={`${redoText} (Ctrl+Shift+Z)`} variant='ghost' size='small' disabled={redoLabel === undefined} onClick={onRedo} />
                <span className='studio-designer-header__saved' role='status' aria-live='polite' data-state={saveState}>{saved}</span>
                {saveState === SaveState.Failed && onRetry !== undefined && <button type='button' onClick={onRetry}>{text.retry}</button>}
            </div>
            <div className='studio-designer-header__device' role='radiogroup' aria-label={text.device}>
                <button type='button' role='radio' aria-checked={device === 'desktop'} aria-label={text.desktop} title={text.desktop} onClick={() => onDevice('desktop')}><FaDesktop aria-hidden='true' /></button>
                <button type='button' role='radio' aria-checked={device === 'mobile'} aria-label={text.mobile} title={text.mobile} onClick={() => onDevice('mobile')}><FaMobileAlt aria-hidden='true' /></button>
            </div>
        </header>
    );
};
