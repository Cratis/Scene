// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HTMLAttributes, useState } from 'react';
import { Dialog } from 'primereact/dialog';

/**
 * Configuration for {@link Image}.
 */
export interface ImageProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /**
     * Where the picture comes from. Optional because a screen under construction routinely names an image
     * before it has one, and that is not a failure worth taking a page down for.
     */
    src?: string;

    /**
     * The alternative text. Defaults to empty, which marks the image decorative - an image with no
     * authored alternative is decorative until someone says otherwise, and inventing text from the file
     * name would put a URL fragment in front of a screen reader.
     */
    alt?: string;

    /**
     * The rendered width, as any CSS length or a bare pixel count.
     */
    width?: string;

    /**
     * The rendered height, as any CSS length or a bare pixel count.
     */
    height?: string;

    /**
     * Whether clicking the image opens it full size in an overlay. Off by default: a picture that grows
     * when clicked is a promise, and one made on every thumbnail in a layout is usually a mistake.
     */
    preview?: boolean;
}

/**
 * A picture, optionally openable full size in an overlay.
 *
 * Cratis owns this component. PrimeReact 10 had `Image`; PrimeReact 11 removed it with no replacement and
 * no headless hook, while `image` remains a name this package's manifest publishes. The plain case is a
 * plain `img` - there was never much to a themed image - and the preview reuses PrimeReact 11's `Dialog`,
 * which survived, so the overlay keeps the application's focus trapping, escape handling and stacking
 * rather than growing a second, worse implementation of all three here.
 *
 * With no `src`, an empty element is rendered rather than a broken `img`. That keeps whatever identifying
 * attributes the caller passed in the document, which is what lets a design-time tool still find and
 * select the element it has not finished authoring.
 *
 * What it deliberately does not carry over from v10: the preview toolbar - zoom in and out, rotate, flip,
 * download - which is a viewer rather than an image and is exactly what the `galleria` component is for;
 * `indicatorIcon` and the hover indicator overlay; the `imageStyle` / `previewStyle` prop pairs, since
 * `className` and `style` already reach the element; and `zoomInDisabled` / `zoomOutDisabled`, which only
 * ever meant anything to that toolbar.
 */
export function Image({ src, alt = '', width, height, preview = false, className, ...rest }: ImageProps) {
    const [open, setOpen] = useState(false);

    if (src === undefined || src === '') return <span {...rest} className={className} />;

    const image = <img src={src} alt={alt} width={width} height={height} className='max-w-full' />;

    if (!preview) {
        return (
            <span {...rest} className={className}>
                {image}
            </span>
        );
    }

    return (
        <span {...rest} className={className}>
            <button
                type='button'
                className='cursor-zoom-in border-0 bg-transparent p-0'
                aria-label={alt === '' ? 'Open image preview' : `Open preview of ${alt}`}
                onClick={() => setOpen(true)}>
                {image}
            </button>
            <Dialog.Root open={open} onOpenChange={(event) => setOpen(event.value === true)} modal dismissable>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Popup>
                            <Dialog.Header>
                                <Dialog.Title>{alt === '' ? 'Preview' : alt}</Dialog.Title>
                                <Dialog.Close aria-label='Close preview'>
                                    <i className='pi pi-times' aria-hidden='true' />
                                </Dialog.Close>
                            </Dialog.Header>
                            <Dialog.Content>
                                <img src={src} alt={alt} className='max-h-[80vh] max-w-[80vw]' />
                            </Dialog.Content>
                        </Dialog.Popup>
                    </Dialog.Positioner>
                </Dialog.Portal>
            </Dialog.Root>
        </span>
    );
}
