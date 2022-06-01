export default function mockFunction<T extends (...args: any[]) => any>(
    fn: T
): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}

export function generateToken(x) {
    const currentDate = new Date();
    const expires_in = new Date(currentDate.getTime() + 30 * 60000); // add 30 mins expiry
    x.expires_in = expires_in;
    return new Buffer(`${JSON.stringify(x)}`).toString('base64');
}
