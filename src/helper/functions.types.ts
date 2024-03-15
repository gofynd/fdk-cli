export interface CreateOptions {
    name?: string;
    type?: FunctionType
}

export interface SyncOptions {
    slug?: string
}

export interface InitOptions {
    slug?: string,
    force: boolean,
}

export interface TestOptions {
    slug?: string
}

export type FunctionType = 'inhook' | 'ingress';

export type UserActions = 'pull' | 'push' | 'cancel';

export interface EventChoices {
    name: string;
    value: string
}[];

export interface Author {
    created_by: string,
    modified_by: string
}

export interface Event {
    event_slug: string,
    event_version: string
}

export interface ConfigEvent {
    name: string,
    version: string
}

export interface Function {
    _id: string,
    name: string,
    slug: string,
    hash: string,
    description: string,
    organization_id: string,
    extension_id: string,
    type: FunctionType,
    created_at: string,
    modified_at: string,
    author: Author,
    __v: number,
}

export interface FunctionVersion {
    _id: string,
    function_id: string,
    current_status: string,
    version: string,
    events: Event[],
    code_snippet: string,
    author: Author,
    created_at: string,
    modified_at: string,
    __v: number
}

export interface FunctionResponse extends Function {
    version_data: FunctionVersion
}

export interface UpdateFunctionVersionResponse extends FunctionVersion {
    function_data: Function
}

export interface CreateFunctionPayload {
    name: string,
    description: string,
    type: FunctionType,
    hook_type?: string,
    target_url?: string,
    events: Event[],
    code_snippet: string,
}

export interface FunctionConfig {
    name: string,
    slug: string,
    description: string,
    type: FunctionType,
    events: ConfigEvent[]
}

export interface UpdateFunctionPayload {
    name: string,
    description: string
}

export interface UpdateFunctionVersionPayload {
    code_snippet: string,
    events: Event[]
}

export type TestStatus = 'PASS' | 'FAIL';

export interface RunTestPayload {
    code: string,
    events: Event[],
    tests: TestPayload[]
}

export interface EventResult {
    status: TestStatus,
    message: string,
    type: string,
    data?: Record<string, any>
}

export interface TestResultEvent {
    results: EventResult[],
    status: TestStatus,
    event_slug: string,
    event_version: string
}

export interface TestCase {
    name: string,
    id: string,
    events: TestResultEvent[],
    status: TestStatus
}

export interface TestResult {
    items: TestCase[],
    status: TestStatus
}

export interface TestEvent {
  event_slug: string;
  event_version: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
}

export interface FunctionTest {
  name: string;
  events: TestEvent[];
}

export interface TestEventModel {
    event_slug: string;
    event_version: string;
    input_data: string;
    output_data: string;
}

export interface FunctionTestModel {
    name: string,
    function_id: string,
    events: TestEventModel[],
    created_at: string,
    modified_at: string,
    __v: number
}

export interface TestPayload {
    name: string,
    events: TestEventModel[]
}

export interface UpdateTestResponse {
    message: string,
    function_data: Function
}

export interface TestResultMessage {
    code: number,
    message: string
}