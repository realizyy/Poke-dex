import { error } from '@sveltejs/kit';
import { HttpError } from './http';

/** 404 only when the upstream says the thing does not exist; anything else is a 502. */
export function failLoad(cause: unknown, notFoundMessage: string): never {
	if (cause instanceof HttpError && cause.status === 404) error(404, notFoundMessage);
	console.error(cause);
	error(502, 'The card database is not responding. Please try again in a moment.');
}
