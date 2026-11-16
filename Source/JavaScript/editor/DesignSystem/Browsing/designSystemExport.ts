// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One file of an exported design system. */
export interface ExportedFile {
    /** The file name. */
    name: string;

    /** What the file holds. */
    content: string;

    /** The media type. */
    type: string;
}

/**
 * The file a design system version is exported as. The version is the host's; the file is an output format
 * for viewing, download and review - nothing reads it back as the truth.
 * @param version The version exported.
 * @param version.number The version number.
 * @param version.screenplay The Screenplay text: design system, themes, ui profile, layouts and templates.
 * @returns The Screenplay file, named for the version.
 */
export const exportedFiles = (version: { number: number; screenplay: string }): readonly ExportedFile[] => [
    { name: `design-system-v${version.number}.play`, content: version.screenplay, type: 'text/plain' },
];

/**
 * Hands a file to the browser as a download.
 * @param file The file.
 */
export const download = (file: ExportedFile) => {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
};
