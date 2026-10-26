// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from '@cratis/scene.model';
import { commandResponseContext, runActions } from '@cratis/scene.engine';
import { InteractionScopeValue } from '@cratis/scene.react';

export function formSuccessContinuation(actions: InteractionAction[] | undefined, command: string, scope: InteractionScopeValue | undefined) {
    if (!actions?.length) return {};
    return { onSuccess: (response: unknown) => {
        if (!scope) return;
        void runActions(actions, scope.dispatcher, commandResponseContext(scope.context, command, response))
            .then(result => { if (result.findings.length) scope.onFindings?.(result.findings); })
            .catch(() => scope.onFindings?.([{ kind: 'invalidResponseBinding', detail: 'Unable to run the form success continuation.' }]));
    } };
}
