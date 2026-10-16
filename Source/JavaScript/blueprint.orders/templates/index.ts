import { fulfilmentBoardTemplate } from './boardTemplate';
import { deliveryCalendarTemplate } from './deliveryTemplate';
import { ordersListTemplate } from './listTemplates';
import { orderPageTemplate } from './recordTemplates';

export * from './listTemplates';
export * from './recordTemplates';
export * from './boardTemplate';
export * from './deliveryTemplate';
export * from './formTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const ordersScreenTemplates = [ordersListTemplate, orderPageTemplate, fulfilmentBoardTemplate, deliveryCalendarTemplate];

export { ordersDialogs as ordersDialogTemplates } from './formTemplates';
