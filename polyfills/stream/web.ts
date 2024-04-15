/* eslint-disable */
interface UnderlyingByteSource {}
interface QueuingStrategy<R> {
	__r: R | undefined;
}
interface UnderlyingSource<R> {
	__r: R | undefined;
}
const ReadableStream = globalThis.ReadableStream;

export type { UnderlyingByteSource, QueuingStrategy, UnderlyingSource };
export { ReadableStream };

export default {
	ReadableStream
};
