import 'dotenv/config';

import * as schema from '../db/schema';

import { reset, seed } from 'drizzle-seed';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const production = {
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
};

const development = {
	url: process.env.SQLITE_FILE_NAME!,
};

export default async function main() {
	const client = createClient(process.env.NODE_ENV === 'production' ? production : development);
	const db = drizzle({
		client,
	});

	await reset(db, schema);
	await seed(db, {
		locations: schema.locations,
		courts: schema.courts,
	}).refine((fake) => {
		return {
			locations: {
				columns: {
					description: fake.loremIpsum({ sentencesCount: 2 }),
					address: fake.streetAddress(),
					city: fake.city(),
				},
				count: 3,
			},
			courts: {
				columns: {
					name: fake.firstName(),
					location_id: fake.int({ minValue: 1, maxValue: 3 }),
					description: fake.loremIpsum({ sentencesCount: 2 }),
					price: fake.valuesFromArray({ values: [20, 25, 30, 35] }),
					size: fake.valuesFromArray({ values: ['full-court', 'half-court'] }),
					type: fake.valuesFromArray({ values: ['indoor', 'outdoor'] }),
					image: fake.default({ defaultValue: 'https://picsum.photos/400/300.webp' }),
				},
				count: 8,
			},
		};
	});
}

main();
