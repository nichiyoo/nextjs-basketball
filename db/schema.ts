import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const locations = sqliteTable('location_table', {
	location_id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	description: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	latitude: real().notNull(),
	longitude: real().notNull(),
	created_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const courts = sqliteTable('court_table', {
	court_id: int().primaryKey({ autoIncrement: true }),
	location_id: int().notNull(),
	name: text().notNull(),
	size: text().notNull(),
	type: text().notNull(),
	price: real().notNull(),
	image: text().notNull(),
	description: text().notNull(),
	created_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const orders = sqliteTable('order_table', {
	order_id: int().primaryKey({ autoIncrement: true }),
	court_id: int().notNull(),
	duration: int().notNull(),
	date: text().notNull(),
	total: real().notNull(),
	created_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const reservations = sqliteTable('reservation_table', {
	reservation_id: int().primaryKey({ autoIncrement: true }),
	order_id: int().notNull(),
	hour: int().notNull(),
	created_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const payments = sqliteTable('payment_table', {
	payment_id: int().primaryKey({ autoIncrement: true }),
	order_id: int().notNull(),
	amount: real().notNull(),
	status: text().notNull(),
	created_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: text()
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const locationRelations = relations(locations, (relation) => {
	return {
		courts: relation.many(courts),
	};
});

export const courtRelations = relations(courts, (relation) => {
	return {
		location: relation.one(locations, {
			fields: [courts.location_id],
			references: [locations.location_id],
		}),
	};
});
