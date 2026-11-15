// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { ProfileSection } from '@cratis/scene.engine';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { inspectorSections, sectionAtScroll } from './ProfileSection';

/** What a host can ask of the inspector: take a section to the top of it, with the flash that says where it went. */
export interface ProfileInspectorHandle {
    scrollTo(section: ProfileSection): void;
}

export interface ProfileInspectorProps {
    strings: UiProfileDesignerStrings;

    /** What each section draws. */
    sections: Record<ProfileSection, ReactNode>;

    /** Called when the section at the top of the inspector changes, by a tab or by scrolling, so the preview can outline what is being edited. */
    onCurrentSection?: (section: ProfileSection) => void;
}

const flashMilliseconds = 1100;

/**
 * The one inspector: six sections in one scroll, with tabs that take you to one - smooth-scrolling, and flashing the section so you see where you
 * landed - and that follow the scroll when you move it yourself. A person who prefers reduced motion gets a jump and a still highlight.
 */
export const ProfileInspector = forwardRef<ProfileInspectorHandle, ProfileInspectorProps>(({ strings, sections, onCurrentSection }, ref) => {
    const scroller = useRef<HTMLDivElement>(null);
    const nodes = useRef(new Map<ProfileSection, HTMLElement>());
    const [current, setCurrent] = useState<ProfileSection>(ProfileSection.App);
    const [flashing, setFlashing] = useState<ProfileSection | undefined>();
    const settling = useRef(false);
    const settleTimer = useRef<number | undefined>(undefined);
    const flashTimer = useRef<number | undefined>(undefined);

    const choose = useCallback((section: ProfileSection) => {
        setCurrent(previous => { if (previous !== section) onCurrentSection?.(section); return section; });
    }, [onCurrentSection]);

    const scrollTo = useCallback((section: ProfileSection) => {
        const node = nodes.current.get(section);
        const container = scroller.current;
        if (node === undefined || container === undefined || container === null) return;
        const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
        // While the smooth scroll runs the tabs must not chase it through the sections it passes.
        settling.current = true;
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => { settling.current = false; }, reduced ? 50 : 700);
        container.scrollTo({ top: node.offsetTop - container.offsetTop, behavior: reduced ? 'auto' : 'smooth' });
        choose(section);
        setFlashing(section);
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlashing(undefined), reduced ? 1500 : flashMilliseconds);
    }, [choose]);

    useImperativeHandle(ref, () => ({ scrollTo }), [scrollTo]);
    useEffect(() => () => { window.clearTimeout(settleTimer.current); window.clearTimeout(flashTimer.current); }, []);

    const follow = () => {
        if (settling.current || scroller.current === null) return;
        const container = scroller.current;
        const tops = inspectorSections.map(section => (nodes.current.get(section)?.offsetTop ?? 0) - container.offsetTop);
        choose(inspectorSections[sectionAtScroll(tops, container.scrollTop)]);
    };

    return (
        <div className='studio-inspector' role='region' aria-label={strings.editor.inspector}>
            <div className='studio-inspector__tabs' role='tablist' aria-label={strings.editor.tabs}>
                {inspectorSections.map(section => (
                    <button key={section} type='button' role='tab' id={`studio-inspector-tab-${section}`} aria-selected={current === section} aria-controls={`studio-inspector-${section}`}
                        onClick={() => scrollTo(section)}>
                        {strings.editor.sections[section]}
                    </button>
                ))}
            </div>
            <div className='studio-inspector__scroll' ref={scroller} onScroll={follow} tabIndex={-1}>
                {inspectorSections.map(section => (
                    <section key={section} id={`studio-inspector-${section}`} ref={node => { if (node === null) nodes.current.delete(section); else nodes.current.set(section, node); }}
                        className='studio-inspector__section' data-section={section} data-flash={flashing === section || undefined} aria-labelledby={`studio-inspector-heading-${section}`} role='tabpanel'>
                        <h2 id={`studio-inspector-heading-${section}`}>{strings.editor.sections[section]}</h2>
                        <p className='studio-inspector__intro'>{strings.editor.sectionIntro[section]}</p>
                        {sections[section]}
                    </section>
                ))}
            </div>
        </div>
    );
});

ProfileInspector.displayName = 'ProfileInspector';
