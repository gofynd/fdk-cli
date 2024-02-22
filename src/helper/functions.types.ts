export type CreateOptions = {
    name?: string;
    type?: FunctionType
}

export type FunctionType = 'inhook' | 'ingress';

export type UserActions = 'pull' | 'push' | 'cancel';

export type EventChoices = {
    name: string;
    value: string
}[];

export type Author = {
    created_by: string,
    modified_by: string
}

export type Event = {
    event_slug: string,
    event_version: string
}

export type ConfigEvent = {
    name: string,
    version: string
}

export type Function = {
    author: Author,
    _id: string,
    name: string,
    slug: string,
    description: string,
    organization_id: string,
    extension_id: string,
    type: FunctionType,
    version: string,
    created_at: string,
    modified_at: string,
    __v: number,
    events: Event[],
    code_snippet: string,
    current_status: string,
    version_id: string
}

export type SyncOptions = {
    slug?: string
}

export type CreateFunctionPayload = {
    name: string,
    description: string,
    type: FunctionType,
    hook_type?: string,
    target_url?: string,
    events: Event[],
    code_snippet: string,
}

export type FunctionConfig = {
    name: string,
    slug: string,
    description: string,
    type: FunctionType,
    events: ConfigEvent[]
}

export type UpdateFunctionPayload = {
    name: string,
    description: string
}

export type UpdateFunctionVersionPayload = {
    code_snippet: string,
    events: Event[]
}