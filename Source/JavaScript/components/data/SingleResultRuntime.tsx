// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useEffect, useMemo, useState } from 'react';
import { ArcContext } from '@cratis/arc.react';
import type { QueryFor } from '@cratis/arc/queries';
import { Guid } from '@cratis/fundamentals';
import type { BoundConstructor } from '../bindings/BoundConstructor';
import { SingleResultStatus } from './SingleResultStatus';

interface Props {
    query: BoundConstructor;
    queryArguments: Record<string, unknown>;
    resultField: string;
    /** queryInputForm alone opts into scalar String/Guid descriptor mapping; no value conversion. */
    stringInputs?: boolean;
}

type Outcome = { state: 'failure' | 'notFound' } | { state: 'success'; value: string };

/**
 * Private execution owner. Arc owns validation, routing, HTTP and deserialization; this component
 * owns only request lifetime and presentation. No shared cache can hand B the result belonging to A.
 */
export default function SingleResultRuntime({ query, queryArguments, resultField, stringInputs = false }: Props) {
    const arc = useContext(ArcContext);
    const { microservice, apiBasePath, origin, httpHeadersCallback, queryVersion } = arc;
    // Identity is deliberate: hosts replace immutable committed arguments rather than mutating them.
    const request = useMemo(() => ({ query, queryArguments, resultField, stringInputs, microservice, apiBasePath, origin, httpHeadersCallback, queryVersion }),
        [query, queryArguments, resultField, stringInputs, microservice, apiBasePath, origin, httpHeadersCallback, queryVersion]);
    const [settled, setSettled] = useState<{ request: typeof request; outcome: Outcome }>();

    useEffect(() => {
        // Each effect setup is a generation, including StrictMode's setup/cleanup/setup replay.
        let current = true;
        let instance: QueryFor<unknown, Record<string, unknown>> | undefined;
        const publish = (outcome: Outcome) => {
            if (current) setSettled({ request, outcome });
        };
        const execute = async () => {
            try {
                // The registry intentionally stores constructors without an eager Arc dependency.
                instance = new request.query() as QueryFor<unknown, Record<string, unknown>>;
                if (instance.enumerable !== false) {
                    publish({ state: 'failure' });
                    return;
                }
                // Arc perform does not validate argument-to-descriptor types. The form supports only
                // scalar String/Guid inputs, matched by exact name and constructor, never by naming
                // convention. This check is lazy and form-only; singleResult's host contract is intact.
                if (request.stringInputs && !Object.entries(request.queryArguments).every(([name, value]) => {
                    const descriptors = instance!.parameterDescriptors.filter(descriptor => descriptor.name === name);
                    return typeof value === 'string' && descriptors.length === 1 && !descriptors[0].isEnumerable
                        && (descriptors[0].type === String || descriptors[0].type === Guid);
                })) {
                    publish({ state: 'failure' });
                    return;
                }
                instance.setMicroservice(request.microservice);
                instance.setApiBasePath(request.apiBasePath ?? '');
                instance.setOrigin(request.origin ?? '');
                instance.setHttpHeadersCallback(request.httpHeadersCallback ?? (() => ({})));
                // Native perform validates required arguments and proxy rules before HTTP. No copying,
                // defaults, business validation, route construction or array wrapping happens here.
                const result = await instance.perform(request.queryArguments);
                if (!current) return;
                if (result.isSuccess !== true || result.isAuthorized !== true || result.isValid !== true || result.hasExceptions !== false || result.isReady === false) {
                    publish({ state: 'failure' });
                    return;
                }
                if (result.data === null || result.data === undefined) {
                    publish({ state: 'notFound' });
                    return;
                }
                if (typeof result.data !== 'object' || Array.isArray(result.data)) {
                    publish({ state: 'failure' });
                    return;
                }
                // Only one own data field, never a path, inherited member, getter or expression.
                const descriptor = Object.getOwnPropertyDescriptor(result.data, request.resultField);
                const value: unknown = descriptor && 'value' in descriptor ? descriptor.value : undefined;
                if (typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) {
                    publish({ state: 'success', value: String(value) });
                } else {
                    publish({ state: 'failure' });
                }
            } catch {
                // Includes native AbortError rejections. Disposed generations cannot publish or leak
                // an unhandled promise, even when the HTTP boundary ignores cancellation.
                publish({ state: 'failure' });
            }
        };
        void execute();
        return () => {
            current = false;
            instance?.abortController?.abort();
        };
    }, [request]);

    // Mask old data during the render that changes inputs, before effect cleanup/setup runs.
    if (settled?.request !== request) return <SingleResultStatus state='loading' />;
    return <SingleResultStatus {...settled.outcome} />;
}
