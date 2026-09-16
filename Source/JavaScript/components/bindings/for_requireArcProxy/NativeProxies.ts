// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryFor, ObservableQueryFor } from '@cratis/arc/queries';
import { Command } from '@cratis/arc/commands';

export class Snapshot extends QueryFor<object[], { projectId: string }> {
    readonly route = '/projects';
    readonly parameterDescriptors = [];
    readonly requiredRequestParameters = ['projectId'];
    defaultValue = [];
    constructor() { super(Object, true); throw new Error('Must not construct during binding'); }
}

export class Live extends ObservableQueryFor<object[], object> {
    readonly route = '/projects';
    readonly parameterDescriptors = [];
    readonly requiredRequestParameters = [];
    readonly defaultValue = [];
    constructor() { super(Object, true); throw new Error('Must not construct during binding'); }
}

export class Save extends Command {
    readonly route = '/save';
    readonly propertyDescriptors = [];
    readonly requestParameters = [];
    constructor() { super(Object, false); throw new Error('Must not construct during binding'); }
}
