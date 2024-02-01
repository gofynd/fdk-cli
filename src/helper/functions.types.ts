export type CreateFunctionOptions = {
    name?: string;
    type?: FunctionType
}

export type FunctionType = 'inhook' | 'ingress';
