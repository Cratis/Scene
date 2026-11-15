// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { CrashBoundary } from '../../Crash/CrashBoundary';
import { defaultCrashStrings } from '../../Crash/CrashStrings';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { ScreenEditorSubject } from './ScreenEditorHost';
import './ScreenEditorOverlay.css';

export interface ScreenEditorBoundaryProps {
    strings: ScreenEditorStrings;

    // What is open: the screen's template or the template being authored, said in the message and written into the report.
    subject?: ScreenEditorSubject;

    // Called when the author closes the message, so the host takes the editor down. Without it there is nothing to close.
    onClose?: (() => void) | undefined;
    children: ReactNode;
}

// Keeps a failure inside the editor inside the editor. The editor is opened over a page that is not its own, and a
// component that throws while drawing the screen - one that needs a provider the host did not supply, say - would otherwise
// unmount that whole page. The message says what failed - the component, the template - and offers Reload, Try again and
// "Report this error"; it uses plain elements for the same reason: it must not depend on what failed.
export const ScreenEditorBoundary = ({ strings, subject, onClose, children }: ScreenEditorBoundaryProps) => (
    <CrashBoundary
        layout='fixed'
        onClose={onClose}
        strings={{ ...defaultCrashStrings, lead: strings.stopped.message, close: strings.stopped.close }}
        context={{
            surface: subject?.authoringTemplate ? 'The screen template editor' : 'The screen editor',
            template: subject?.authoringTemplate ?? subject?.screenTemplate,
        }}>
        {children}
    </CrashBoundary>
);
