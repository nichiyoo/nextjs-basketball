import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

const current = sql`(unixepoch())`;

export const locations = sqliteTable('location_table', {
	location_id: integer('location_id').primaryKey(),
	name: text().notNull(),
	description: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	latitude: real().notNull(),
	longitude: real().notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(current),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(current)
		.$onUpdate(() => current),
});

export const courts = sqliteTable('court_table', {
	court_id: integer('court_id').primaryKey(),
	location_id: integer()
		.references(() => locations.location_id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	name: text().notNull(),
	description: text().notNull(),
	size: text('size', { enum: ['full-court', 'half-court'] }).notNull(),
	type: text('type', { enum: ['indoor', 'outdoor'] }).notNull(),
	price: real().notNull(),
	image: text().notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(current),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(current)
		.$onUpdate(() => current),
});

export const orders = sqliteTable('order_table', {
	order_id: integer('order_id').primaryKey(),
	court_id: integer()
		.references(() => courts.court_id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	email: text('email').notNull(),
	total: real().notNull(),
	duration: integer().notNull(),
	date: integer('date', { mode: 'timestamp' }).notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(current),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(current)
		.$onUpdate(() => current),
});

export const reservations = sqliteTable('reservation_table', {
	reservation_id: integer('reservation_id').primaryKey(),
	order_id: integer()
		.references(() => orders.order_id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	hour: integer().notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(current),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(current)
		.$onUpdate(() => current),
});

export const payments = sqliteTable('payment_table', {
	payment_id: integer('payment_id').primaryKey(),
	order_id: integer()
		.references(() => reservations.reservation_id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	amount: real().notNull(),
	status: text().notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(current),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(current)
		.$onUpdate(() => current),
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

export const orderRelations = relations(orders, (relation) => {
	return {
		court: relation.one(courts, {
			fields: [orders.order_id],
			references: [courts.court_id],
		}),
	};
});
