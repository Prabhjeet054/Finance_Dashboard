import 'dotenv/config';

const QUOTED_VALUE_PATTERN = /^(["'])(.*)\1$/;

for (const [key, value] of Object.entries(process.env)) {
	if (!value) {
		continue;
	}

	const trimmed = value.trim();
	const match = trimmed.match(QUOTED_VALUE_PATTERN);

	if (match) {
		process.env[key] = match[2];
	}
}
