import * as z from 'zod';

import { InferSelectModel, and, eq, inArray } from 'drizzle-orm';
import { add, startOfDay } from 'date-fns';
import { courts, orders, reservations } from '@/db/schema';

import { Court } from '@/lib/type';
import { Hono } from 'hono';
import db from '@/lib/drizzle';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

app.get('/locations', async (c) => {
	const data = await db.query.locations.findMany();

	return c.json({
		message: 'Successfully fetched locations data',
		data,
	});
});

app.get('/courts', async (c) => {
	const data = await db.query.courts.findMany({
		with: {
			location: true,
		},
	});

	return c.json({
		message: 'Successfully fetched courts data',
		data,
	});
});

app.get('/courts/:id', async (c) => {
	const id = c.req.param('id');
	const schema = z.object({
		id: z.coerce.number(),
	});

	const { data: result, success, error } = schema.safeParse({ id });
	if (!success) {
		return c.json({
			message: error.message,
			error: error.errors,
		});
	}

	const data = await db.query.courts.findFirst({
		where: eq(courts.court_id, result.id),
		with: {
			location: true,
		},
	});

	return c.json({
		message: 'Successfully fetched courts data',
		data,
	});
});

app.get('/search', async (c) => {
	const query = c.req.query();
	const schema = z.object({
		location: z.string().optional(),
		type: z.enum(['indoor', 'outdoor', 'all']).optional(),
		size: z.enum(['full-court', 'half-court', 'all']).optional(),
	});

	const { data: result, success, error } = schema.safeParse(query);
	if (!success) {
		return c.json({
			message: error.message,
			error: error.errors,
		});
	}

	const data = await db.query.courts.findMany({
		where: and(
			eq(courts.location_id, Number(query.location)).if(query.location && query.location !== 'all'),
			eq(courts.type, result.type as Court['type']).if(query.type && result.type !== 'all'),
			eq(courts.size, result.size as Court['size']).if(query.size && result.size !== 'all')
		),
	});

	return c.json({
		message: 'Successfully fetched courts data',
		data,
	});
});

app.get('/reservations/:court_id', async (c) => {
	const params = c.req.param();
	const search = c.req.query();
	const schema = z.object({
		court_id: z.coerce.number(),
		date: z.coerce.date(),
	});

	const {
		data: result,
		success,
		error,
	} = schema.safeParse({
		...params,
		...search,
	});

	if (!success) {
		return c.json({
			message: error.message,
			error: error.errors,
		});
	}

	const date = startOfDay(result.date);
	const ordered = await db.query.orders.findMany({
		where: and(eq(orders.court_id, result.court_id), eq(orders.date, date)),
	});

	if (!ordered) {
		return c.json({
			message: 'Successfully fetched reservation, but no order found',
			error: null,
			data: [],
		});
	}

	const data = await db.query.reservations.findMany({
		where: inArray(
			reservations.order_id,
			ordered.map((order) => order.order_id)
		),
	});

	return c.json({
		message: 'Successfully fetched reservation',
		error: null,
		data,
	});
});

app.post('/reservations/:court_id', async (c) => {
	const params = c.req.param();
	const body = await c.req.json();

	const schema = z.object({
		court_id: z.coerce.number(),
		email: z.string().email(),
		date: z.coerce.date(),
		players: z.number().min(1).max(10),
		timetables: z.array(z.string()).nonempty(),
	});

	const {
		data: result,
		success,
		error,
	} = schema.safeParse({
		...params,
		...body,
	});

	if (!success) {
		return c.json({
			message: error.message,
			error: error.errors,
		});
	}

	const today = new Date();
	const day = startOfDay(today);
	const date = startOfDay(result.date);
	const start = add(day, { days: 1 });
	const end = add(start, { months: 1 });

	if (date < start || date > end) throw new Error('Date is out of range');

	const ordered = await db.query.orders.findMany({
		where: and(eq(orders.court_id, result.court_id), eq(orders.date, date)),
	});

	if (ordered) {
		const reserved = await db.query.reservations.findMany({
			where: inArray(
				reservations.order_id,
				ordered.map((order) => order.order_id)
			),
		});

		if (reserved.map((item) => item.hour.toString()).some((hour) => result.timetables.includes(hour))) {
			throw new Error('This time slot is already reserved');
		}
	}

	const inserted = await db
		.insert(orders)
		.values({
			date: date,
			court_id: result.court_id,
			duration: result.timetables.length,
			total: result.players * result.timetables.length,
		})
		.returning();

	if (!inserted || inserted.length === 0) throw new Error('Error creating order');

	const data = await db.insert(reservations).values(
		result.timetables.map((timetable) => ({
			order_id: inserted[0].order_id,
			hour: parseInt(timetable.slice(0, 2)),
		}))
	);

	return c.json({
		message: 'Successfully created reservation',
		error: null,
		data,
	});
});

app.onError((err, c) => {
	return c.json(
		{
			message: 'Internal Server Error',
			error: err.message,
		},
		500
	);
});

export const GET = handle(app);
export const POST = handle(app);
