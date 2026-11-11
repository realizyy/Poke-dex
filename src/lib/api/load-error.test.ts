import { describe, expect, it, vi } from 'vitest';
import { HttpError } from './http';
import { failLoad } from './load-error';

function statusOf(run: () => never): number | undefined {
	try {
		run();
	} catch (thrown) {
		return (thrown as { status?: number }).status;
	}
}

describe('failLoad', () => {
	it('answers 404 when the upstream says the thing does not exist', () => {
		expect(statusOf(() => failLoad(new HttpError(404, 'https://x'), 'gone'))).toBe(404);
	});

	it('answers 502 for an upstream failure and logs it', () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(statusOf(() => failLoad(new HttpError(503, 'https://x'), 'gone'))).toBe(502);
		expect(statusOf(() => failLoad(new TypeError('network down'), 'gone'))).toBe(502);
		expect(log).toHaveBeenCalledTimes(2);
		log.mockRestore();
	});
});
