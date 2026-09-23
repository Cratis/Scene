// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Command, CommandValidator } from '@cratis/arc/commands';
import { PropertyDescriptor } from '@cratis/arc/reflection';
import { Guid } from '@cratis/fundamentals';

class ProjectValidator extends CommandValidator<{ name: string }> {
    constructor() {
        super();
        this.ruleFor(command => command.name).notEmpty().withMessage('Name is required');
    }
}

/** Generated-shape proxy: native execution and serialization, only fetch is substituted. */
export class StartProject extends Command {
    readonly route: string = '/synthetic/projects';
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid), new PropertyDescriptor('name', String)];
    readonly requestParameters = [];
    readonly validation = new ProjectValidator();
    projectId: Guid = Guid.empty;
    name = '';
    constructor() { super(Object, false); }
}

export class RestrictedProject extends StartProject {
    readonly roles = ['project-writer'];
}

export class OptionalUnsupported extends StartProject {
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid), new PropertyDescriptor('name', String), new PropertyDescriptor('details', Object, true)];
    details?: object;
}

export class RequiredUnsupported extends OptionalUnsupported {
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid), new PropertyDescriptor('name', String), new PropertyDescriptor('details', Object)];
}

export class AmbiguousProject extends StartProject {
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid), new PropertyDescriptor('name', String), new PropertyDescriptor('projectId', Guid)];
}
