import slugify from 'slugify';
import { nanoid } from 'nanoid';

const SLUG_SUFFIX_LENGTH = 6;

function createSlugBase(input: string): string {
	const slug = slugify(input, {
		lower: true,
		strict: true,
		trim: true,
	});

	return slug || 'item';
}

export function generateSlug(input: string, suffix?: string): string {
	const slugBase = createSlugBase(input);
	const slugSuffix = suffix ?? nanoid(SLUG_SUFFIX_LENGTH);

	return `${slugBase}-${slugSuffix}`;
}

export function generateUserSlug(name: string): string {
	return generateSlug(name);
}

export function generateRecordSlug(category: string, date: string): string {
	return generateSlug(`${category}-${date}`);
}
