import { courts, locations } from './schema';

import { InferSelectModel } from 'drizzle-orm';
import db from '../lib/drizzle';
import { faker } from '@faker-js/faker';

faker.seed(1234);

const createRandomCourt = () => ({
	name: faker.location.street() + ' Court',
	description: faker.lorem.sentence(20),
	size: faker.helpers.arrayElement(['full-court', 'half-court']),
	type: faker.helpers.arrayElement(['indoor', 'outdoor']),
	price: faker.number.float({ min: 15, max: 50, multipleOf: 0.5 }),
	image: faker.image.urlLoremFlickr({ category: 'sports' }),
});

const createRandomLocation = () => ({
	name: faker.location.street(),
	description: faker.lorem.sentence(20),
	address: faker.location.streetAddress(),
	city: faker.location.city(),
	state: faker.location.state(),
	latitude: faker.location.latitude(),
	longitude: faker.location.longitude(),
});

(async () => {
	const locationsSeed = faker.helpers.multiple(createRandomLocation, {
		count: 6,
	});

	await db.insert(locations).values(locationsSeed);
	const select = await db.select().from(locations);

	select.forEach(async (location: InferSelectModel<typeof locations>) => {
		const courstSeed = faker.helpers.multiple(createRandomCourt, {
			count: 10,
		});

		await db.insert(courts).values(
			courstSeed.map((court) => ({
				...court,
				location_id: location.location_id,
			}))
		);
	});
})();
