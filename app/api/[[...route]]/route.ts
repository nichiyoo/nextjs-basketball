import * as z from 'zod';

import { and, eq, inArray } from 'drizzle-orm';
import { courts, orders, reservations } from '@/db/schema';

import { Hono } from 'hono';
import { add } from 'date-fns';
import db from '@/lib/drizzle';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');
const ERROR_STATUS = 500;

app.get('/locations', async (c) => {
	try {
		const data = await db.query.locations.findMany();

		return c.json({
			message: 'Successfully fetched locations data',
			data,
		});
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error fetching locations data',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

app.get('/courts', async (c) => {
	try {
		const data = await db.query.courts.findMany({
			with: {
				location: true,
			},
		});

		return c.json({
			message: 'Successfully fetched courts data',
			data,
		});
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error fetching courts data',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

app.get('/courts/:id', async (c) => {
	try {
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
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error fetching courts data',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

app.get('/search', async (c) => {
	try {
		const query = c.req.query();
		const data = await db.query.courts.findMany({
			where: and(
				eq(courts.location_id, Number(query.location)).if(query.location && query.location !== 'all'),
				eq(courts.type, query.type).if(query.type && query.type !== 'all'),
				eq(courts.size, query.size).if(query.size && query.size !== 'all')
			),
		});

		return c.json({
			message: 'Successfully fetched courts data',
			data,
		});
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error fetching courts data',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

app.get('/reservations/:court_id', async (c) => {
	try {
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

		const ordered = await db.query.orders.findMany({
			where: and(eq(orders.court_id, result.court_id), eq(orders.date, result.date.toISOString())),
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
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error fetching reservations',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

app.post('/reservations/:court_id', async (c) => {
	try {
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
		const dateStart = add(today, { days: 1 });
		const dateEnd = add(dateStart, { months: 1 });
		if (result.date < dateStart || result.date > dateEnd) {
			throw new Error('Date is out of range');
		}

		const ordered = await db.query.orders.findMany({
			where: and(eq(orders.court_id, result.court_id), eq(orders.date, result.date.toISOString())),
		});

		if (ordered) {
			const reserved = await db.query.reservations.findMany({
				where: inArray(
					reservations.order_id,
					ordered.map((order) => order.order_id)
				),
			});

			if (reserved.map((r) => r.hour.toString()).some((r) => result.timetables.includes(r))) {
				throw new Error('This time slot is already reserved');
			}
		}

		const inserted = await db
			.insert(orders)
			.values({
				court_id: result.court_id,
				date: result.date.toISOString(),
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
	} catch (error: unknown) {
		console.error(error);
		return c.json(
			{
				message: 'Error getting reservations',
				error: (error as Error).message,
			},
			ERROR_STATUS
		);
	}
});

export const GET = handle(app);
export const POST = handle(app);
