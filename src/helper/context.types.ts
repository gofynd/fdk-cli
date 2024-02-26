export interface FunctionContext {
    slug: string,
    hash: string
}

export interface ActiveExtensionContext {
    name: string,
    extension_id: string,
    cluster_url: string,
    organization_id: string,
    functions?: FunctionContext[]
}

export interface ExtensionContext {
    active_context: string;
    contexts: Record<string, ActiveExtensionContext>
}

export interface FDKContext {
    extension: ExtensionContext
}