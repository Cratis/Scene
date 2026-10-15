// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope, TemplateSliceKind } from '@cratis/scene.model';
import { TemplateContainer } from '../templateApplicability';

/** Where a template is about to be applied: a level of the application hierarchy and what it sits inside. */
export interface TemplateTarget {
    /** The hierarchy level. */
    scope: TemplateScope;

    /** The kind of the slice when `scope` is {@link TemplateScope.Slice}. */
    sliceKind?: TemplateSliceKind;

    /** The layout or template whose slots the template must fit, if known. */
    container?: TemplateContainer;

    /**
     * The names of the templates already chosen above the target, outermost first. A template in the chain is not
     * offered again, because nesting it inside itself would loop.
     */
    chain?: string[];
}
