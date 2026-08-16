// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Paginator, type PaginatorPagesInstance, type PaginatorRootChangeEvent } from 'primereact/paginator';

/**
 * How a caller drives {@link Pagination}.
 */
export interface PaginationProps {
    /**
     * The page being shown, counted from one. PrimeReact 11's paginator is one-based throughout - its
     * `defaultPage` is `1`, and the page numbers it reports back are the ones it prints - so the adapters
     * count the same way rather than translating at every edge.
     */
    page: number;

    /**
     * How many records there are in total, across all pages.
     */
    total: number;

    /**
     * How many records fit on a page.
     */
    itemsPerPage: number;

    /**
     * Called with the page the user asked for.
     */
    onPageChange: (page: number) => void;

    /**
     * The Scene element id to tag the rendered paginator with, when the paginator *is* the adapter's
     * output rather than a part of it.
     */
    sceneId?: string;
}

/**
 * Page navigation, assembled once from PrimeReact 11's paginator parts.
 *
 * PrimeReact 11 ships the paginator as a namespace of parts - a root that owns the page arithmetic and
 * hands out pre-built button props, and separate first/previous/pages/next/last elements the caller
 * arranges. That is more expressive than PrimeReact 10's single component, but it is also several dozen
 * lines that two adapters in this folder would otherwise both write out: the `paginator` component
 * itself, and `dataView`, which in PrimeReact 11 no longer owns its data and so cannot page it either.
 * Assembling it here means the two agree on what a paginator looks like.
 *
 * The paginator is driven as a controlled component so the caller always knows which page is showing -
 * `dataView` needs it to slice its rows, and an uncontrolled paginator would keep that inside itself.
 *
 * @param props How to drive the paginator.
 * @returns The paginator.
 */
export function Pagination({ page, total, itemsPerPage, onPageChange, sceneId }: PaginationProps) {
    return (
        <Paginator.Root
            data-scene-id={sceneId}
            page={page}
            total={total}
            itemsPerPage={itemsPerPage}
            onPageChange={(event: PaginatorRootChangeEvent) => onPageChange(event.value)}>
            <Paginator.Content>
                <Paginator.First>«</Paginator.First>
                <Paginator.Prev>‹</Paginator.Prev>
                <Paginator.Pages>
                    {(pages: PaginatorPagesInstance) =>
                        pages.paginator?.pages.map((item, index) =>
                            item.type === 'page' ? (
                                <Paginator.Page key={`page-${item.value}`} value={item.value} />
                            ) : (
                                <Paginator.Ellipsis key={`ellipsis-${index}`}>…</Paginator.Ellipsis>
                            )
                        )
                    }
                </Paginator.Pages>
                <Paginator.Next>›</Paginator.Next>
                <Paginator.Last>»</Paginator.Last>
            </Paginator.Content>
        </Paginator.Root>
    );
}
