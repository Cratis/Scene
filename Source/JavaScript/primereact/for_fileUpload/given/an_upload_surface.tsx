// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { FileUploadHandler, FileUploadHandlerProvider } from '../../file';
import { primeReactComponents } from '../../primeReactComponents';
import { sceneComponent } from '../../storyElements';

export interface UploadSurface {
    container: HTMLElement;

    /** The file input the user chooses through. */
    input: HTMLInputElement;

    /** The drop zone. */
    zone: HTMLElement;

    /** Chooses files the way the browser reports them. */
    choose(...files: File[]): void;

    /** Drops files on the zone. */
    drop(...files: File[]): void;
}

export const file = (name: string, type = 'text/plain', size = 5) => new File(['x'.repeat(size)], name, { type });

/** Renders a file upload element through the real registry, optionally inside a host's provider. */
export function renderUpload(
    properties: Record<string, unknown>,
    options: { handler?: FileUploadHandler; allowedOrigins?: string[]; isEnabled?: boolean; provider?: boolean } = {}
): UploadSurface {
    const element = { ...sceneComponent('upload', 'fileUpload', properties), isEnabled: options.isEnabled ?? true };
    const view = <SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />;
    const { container } = render(
        <PrimeReactProvider>
            {options.provider === false ? view : <FileUploadHandlerProvider handler={options.handler} allowedOrigins={options.allowedOrigins}>{view}</FileUploadHandlerProvider>}
        </PrimeReactProvider>
    );

    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    const zone = screen.getByRole('region');
    return {
        container,
        input,
        zone,
        choose: (...files) => fireEvent.change(input, { target: { files } }),
        drop: (...files) => fireEvent.drop(zone, { dataTransfer: { files } }),
    };
}
