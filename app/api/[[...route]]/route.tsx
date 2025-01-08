import * as z from 'zod';

import { add, startOfDay } from 'date-fns';
import { and, eq, inArray } from 'drizzle-orm';
import { courts, orders, reservations } from '@/db/schema';

import { Court } from '@/lib/type';
import { Hono } from 'hono';
import PaymentNotificationEmail from '@/emails/payment-notification';
import PaymentSuccessEmail from '@/emails/payment-success';
import axios from '@/lib/axios';
import db from '@/lib/drizzle';
import { handle } from 'hono/vercel';
import { render } from '@react-email/components';
import transporter from '@/lib/nodemailer';

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
		return c.json(
			{
				message: error.message,
				error: error.errors,
			},
			400
		);
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
		return c.json(
			{
				message: error.message,
				error: error.errors,
			},
			400
		);
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
		return c.json(
			{
				message: error.message,
				error: error.errors,
			},
			400
		);
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
		return c.json(
			{
				message: error.message,
				error: error.errors,
			},
			400
		);
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

	const court = await db.query.courts.findFirst({
		where: eq(courts.court_id, result.court_id),
	});

	if (!court) {
		return c.json(
			{
				message: 'This court does not exist',
				error: null,
			},
			400
		);
	}

	const created = await db.transaction(async (tx) => {
		const [order] = await tx
			.insert(orders)
			.values({
				date: date,
				email: result.email,
				court_id: result.court_id,
				duration: result.timetables.length,
				total: result.timetables.length * court.price,
			})
			.returning();

		await tx.insert(reservations).values(
			result.timetables.map((timetable) => ({
				order_id: order.court_id,
				hour: parseInt(timetable.slice(0, 2)),
			}))
		);

		return order;
	});

	const order = await db.query.orders.findFirst({
		where: eq(orders.order_id, created.order_id),
		with: {
			court: {
				with: {
					location: true,
				},
			},
		},
	});

	if (!order) throw new Error('Error finding order');

	const { data: payment } = await axios.post(
		process.env.MIDTRANS_API_URL as string,
		{
			transaction_details: {
				order_id: order.order_id,
				gross_amount: order.total,
				customer_details: {
					email: order.email,
					billing_address: {
						email: order.email,
					},
				},
				item_details: [
					{
						id: order.order_id,
						name: court.name,
						price: order.total,
						quantity: order.duration,
					},
				],
			},
		},
		{
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64'),
			},
		}
	);

	const email = await render(
		<PaymentNotificationEmail
			customerEmail={order.email}
			companyDetails={{
				year: new Date().getFullYear(),
				name: process.env.NEXT_PUBLIC_COMPANY_NAME as string,
				address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS as string,
			}}
			orderDetails={{
				orderId: order.order_id,
				courtName: order.court.name,
				locationName: order.court.location.name,
				date: new Date(order.date).toLocaleString(),
				duration: order.duration,
				total: order.total,
			}}
			paymentUrl={payment.redirect_url}
		/>
	);

	await transporter.sendMail({
		from: process.env.NODEMAILER_FROM,
		to: result.email,
		subject: 'Rerservation Payment Pending',
		html: email,
	});

	return c.json({
		message: 'Successfully created reservation',
		error: null,
	});
});

app.post('/payments/callback', async (c) => {
	const body = await c.req.json();

	const statuses = [
		'capture',
		'settlement',
		'pending',
		'deny',
		'cancel',
		'expire',
		'failure',
		'refund',
		'partial_refund',
		'authorize',
	] as const;

	const schema = z.object({
		order_id: z.coerce.number(),
		signature_key: z.string(),
		status_code: z.string(),
		gross_amount: z.coerce.number(),
		transaction_status: z.enum(statuses),
	});

	const { data: result, success, error } = schema.safeParse(body);
	if (!success) {
		return c.json(
			{
				message: error.message,
				error: error.errors,
			},
			400
		);
	}

	if (result.transaction_status !== 'settlement') return c.status(200);

	const order = await db.query.orders.findFirst({
		where: eq(orders.order_id, result.order_id),
		with: {
			court: {
				with: {
					location: true,
				},
			},
		},
	});

	if (!order) return c.status(404);
	if (order.total !== result.gross_amount) return c.status(404);

	const email = await render(
		<PaymentSuccessEmail
			customerEmail={order.email}
			companyDetails={{
				year: new Date().getFullYear(),
				name: process.env.NEXT_PUBLIC_COMPANY_NAME as string,
				address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS as string,
			}}
			orderDetails={{
				orderId: order.order_id,
				courtName: order.court.name,
				locationName: order.court.location.name,
				date: new Date(order.date).toLocaleString(),
				duration: order.duration,
				total: order.total,
			}}
			courtDetails={{
				type: order.court.type,
				size: order.court.size,
			}}
		/>
	);

	await transporter.sendMail({
		from: process.env.NODEMAILER_FROM,
		to: order.email,
		subject: 'Rerservation Payment Confirmed',
		html: email,
	});

	return c.status(200);
});

app.onError((err, c) => {
	console.error(err);
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
