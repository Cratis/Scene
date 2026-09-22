// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Canonical Projects/Registration/ProjectLookup/ProjectLookup.ts generated consumer shape.
// Keep Guid parameters, descriptors, model decorators, default value and native methods intact.
import { QueryFor, QueryResultWithState } from '@cratis/arc/queries';
import { useQuery, useSuspenseQuery, PerformQuery, SetSorting, QueryWhen } from '@cratis/arc.react/queries';
import { ParameterDescriptor } from '@cratis/arc/reflection';
import { Guid, field } from '@cratis/fundamentals';

export interface ProjectByIdParameters {
    projectId: Guid;
}

export class ProjectById extends QueryFor<ProjectSummary, ProjectByIdParameters> {
    readonly route: string = '/api/projects/registration/project-lookup/project-by-id';
    readonly queryName: string = 'CanonicalProjects.Projects.Registration.ProjectLookup.ProjectSummary.ProjectById';
    readonly treatWarningsAsErrors: boolean = false;
    readonly roles: string[] = [];
    readonly defaultValue: ProjectSummary = {} as ProjectSummary;

    constructor() {
        super(ProjectSummary, false);
    }

    get requiredRequestParameters(): string[] {
        return ['projectId'];
    }

    readonly parameterDescriptors: ParameterDescriptor[] = [
        new ParameterDescriptor('projectId', Guid, false),
    ];

    projectId!: Guid;

    static use(args?: ProjectByIdParameters): [QueryResultWithState<ProjectSummary>, PerformQuery<ProjectByIdParameters>, SetSorting] {
        return useQuery<ProjectSummary, ProjectById, ProjectByIdParameters>(ProjectById, args);
    }

    static useSuspense(args?: ProjectByIdParameters): [QueryResultWithState<ProjectSummary>, PerformQuery<ProjectByIdParameters>, SetSorting] {
        return useSuspenseQuery<ProjectSummary, ProjectById, ProjectByIdParameters>(ProjectById, args);
    }

    static when(condition: boolean): QueryWhen<ProjectById, ProjectSummary, ProjectByIdParameters> {
        return new QueryWhen<ProjectById, ProjectSummary, ProjectByIdParameters>(ProjectById, condition);
    }
}

export class ProjectSummary {
    @field(String)
    name!: string;
    @field(Guid)
    projectId!: Guid;
}
