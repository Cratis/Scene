// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { masterDetailScreenTemplate } from '@cratis/scene.blueprint.default';
import { TicketingQuery, fromQuery, localeOfData } from '../ticketingQueries';
import { actionButton, component, goesTo, ticketingMetadata, withBehaviors } from '../ticketingParts';

/**
 * The knowledge base (the foundation `MasterDetail`): a search box and the tree of categories and articles on the left, the chosen article on the right. The
 * choice lives in the address, so a link opens an article and the back button returns to the tree; on a phone the two become a navigation stack. The
 * tree is the foundation `orgTree` - which builds a tree from flat rows of `id`, `label` and `parentId` and follows the ARIA tree pattern - so a category is a
 * row with no parent and an article is a row whose parent is its category.
 */
export const knowledgeBaseTemplate: ScreenTemplate = {
    name: 'KnowledgeBase',
    fitsSlot: 'content',
    slots: masterDetailScreenTemplate.slots,
    arrangement: masterDetailScreenTemplate.arrangement,
    content: {
        list: [
            component('kb-search', 'globalSearch', { placeholder: 'Search the knowledge base', label: 'Search the knowledge base', urlKey: 'kbq' }),
            component('kb-tree', 'orgTree', { nodes: fromQuery(TicketingQuery.ArticleTree), urlKey: 'article', expandedDepth: 1, label: 'Articles', ...localeOfData }),
        ],
        details: [
            component('kb-header', 'pageHeader', { title: fromQuery(TicketingQuery.Article, '0.title'), subtitle: fromQuery(TicketingQuery.Article, '0.category') }, {
                actions: [withBehaviors(actionButton('kb-new-ticket', 'Still need help?', 'primary'), goesTo('support.queue.portal'))],
            }),
            component('kb-tabs', 'tabSet', { tabs: fromQuery(TicketingQuery.ArticleTabs), urlKey: 'kbtab', label: 'Article sections' }),
            component('kb-article', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(TicketingQuery.ArticleSections), values: fromQuery(TicketingQuery.Article, '0'), ...localeOfData }),
        ],
    },
    displayName: 'Knowledge base',
    description: 'Categories and articles as a tree with search on the left, the chosen article on the right; a navigation stack on a phone.',
    metadata: ticketingMetadata('KnowledgeBase', 'Workspace', [TemplateScope.Module, TemplateScope.Feature]),
};
