// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from '@cratis/components/Common';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemVersion } from '../DesignSystemHost';
import { fill } from '../fill';
import { Panel } from '../Parts/Panel';
import { download, exportedFiles, type ExportedFile } from './designSystemExport';
import { SourceView } from './SourceView';

export interface ScreenplayViewProps {
    /** The version shown. */
    version: DesignSystemVersion;

    /** The words to use. */
    strings: DesignSystemEditorStrings;

    /** Hands a file to the person. Absent: the browser downloads it. */
    onDownload?: (file: ExportedFile) => void;
}

/** The Screenplay half of the design system: the ui profile, its layouts and templates, and the source they come from. */
export const ScreenplayView = ({ version, strings, onDownload = download }: ScreenplayViewProps) => {
    const words = strings.screenplay;
    const { outline } = version;
    const list = (names: readonly string[]) => names.length === 0
        ? <span className='studio-design-system__note'>{words.none}</span>
        : <ul className='studio-design-system__tags'>{names.map(name => <li key={name}>{name}</li>)}</ul>;
    const facts: [string, string | undefined][] = [
        [words.profile, outline.profile],
        [words.theme, outline.theme],
        [words.rootTemplate, outline.rootTemplate],
        [words.platforms, outline.platforms.join(', ')],
        [words.packages, outline.packages.join(', ')],
    ];

    return (
        <div className='studio-design-system__stack'>
            <Panel title={words.profileTitle} description={words.profileDescription}>
                <dl className='studio-design-system__facts'>
                    {facts.map(([name, value]) => (
                        <div key={name} className='studio-design-system__fact'>
                            <dt>{name}</dt>
                            <dd>{value === undefined || value === '' ? '-' : value}</dd>
                        </div>
                    ))}
                </dl>
            </Panel>
            <Panel title={words.layouts}>{list(outline.layouts)}</Panel>
            <Panel title={words.screenTemplates}>{list(outline.screenTemplates)}</Panel>
            <Panel title={words.dialogTemplates}>{list(outline.dialogTemplates)}</Panel>
            <Panel title={words.sourceTitle} description={fill(words.sourceDescription, { version: version.number })}>
                <div className='studio-design-system__actions'>
                    {exportedFiles(version).map(file => (
                        <Button key={file.name} label={fill(words.download, { file: file.name })} icon='pi pi-download' onClick={() => onDownload(file)} />
                    ))}
                </div>
                <SourceView value={version.screenplay} label={strings.overview.sourceLabel} />
            </Panel>
        </div>
    );
};
