'use client';

import * as React from 'react';
import * as z from 'zod';

import { CalendarIcon, Loader2 } from 'lucide-react';
import { Court, Location, Reservation } from '@/lib/type';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { add, format } from 'date-fns';
import axios, { isAxiosError } from '@/lib/axios';
import { cn, formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CourtDetailsCard } from '@/components/court/court-detail';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';

type ReservationReseponse = { message: string; data: Reservation[] };
interface ReservationProps {
	court: Court & {
		location: Location;
	};
}

const reservationSchema = z.object({
	email: z.string().email(),
	date: z.date(),
	players: z.number().min(1).max(10),
	timetables: z.array(z.string()).nonempty('you must select at least one time slot'),
});

export const ReservationForm: React.FC<ReservationProps> = ({ court, ...props }) => {
	const [loading, setLoading] = React.useState(false);

	const start = 0;
	const end = 23;

	const today = new Date();
	const dateStart = add(today, { days: 1 });
	const dateEnd = add(dateStart, { months: 1 });

	const { toast } = useToast();

	const form = useForm<z.infer<typeof reservationSchema>>({
		resolver: zodResolver(reservationSchema),
		defaultValues: {
			email: '',
			players: 1,
			date: dateStart,
			timetables: [],
		},
	});

	const availables = Array.from({ length: end - start + 1 }, (_, i) => i + start).map((value) => ({
		value: value.toString(),
		label: value.toString().padStart(2, '0') + ':00',
	}));

	const [reserved, setReserved] = React.useState<Reservation[]>([]);
	const date = form.watch('date');

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await axios.get<ReservationReseponse>('/reservations/' + court.court_id, {
					params: {
						date: date.toISOString(),
					},
				});
				setReserved(data.data);
				form.resetField('timetables');
			} catch (error: unknown) {
				if (isAxiosError(error)) {
					toast({
						title: error.response?.data?.message,
						description: error.response?.data?.error,
					});
				}
				console.error(error);
			}
		};

		fetchData();
	}, [court, toast, date, form]);

	const onSubmit = async (formData: z.infer<typeof reservationSchema>) => {
		try {
			setLoading(true);
			const { data } = await axios.post('/reservations/' + court.court_id, formData);
			form.reset({
				...form.getValues(),
				timetables: [],
			});
			toast({
				title: 'Successfully created reservation',
				description: data.message,
			});
		} catch (error) {
			if (isAxiosError(error)) {
				toast({
					title: error.response?.data?.message,
					description: error.response?.data?.error,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='space-y-6'>
			<CourtDetailsCard court={court} />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='grid lg:grid-cols-2 gap-6 items-center'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem className='col-span-full'>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder='your@email.com' {...field} />
								</FormControl>
								<FormDescription>
									Make sure to input valid email address, this is required for us to send you the
									confirmation
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='date'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Reservation Date</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant='outline'
												className={cn(
													'w-full pl-3 text-left font-normal',
													!field.value && 'text-muted-foreground'
												)}>
												{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
												<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0' align='start'>
										<Calendar
											mode='single'
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) => date < today || date > dateEnd}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormDescription>Select the date for your reservation</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='players'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Number of Players</FormLabel>
								<Select
									onValueChange={(value) => field.onChange(parseInt(value))}
									defaultValue={field.value.toString()}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Select number of players' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
											<SelectItem key={num} value={num.toString()}>
												{num}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>Choose the number of players (1-10)</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='timetables'
						render={({ field }) => (
							<FormItem className='col-span-full'>
								<FormLabel>Available Times</FormLabel>
								<FormControl>
									<div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2'>
										{availables.map((time) => {
											const check = reserved.some((r) => r.hour.toString() === time.value);

											return (
												<Button
													type='button'
													key={time.value}
													variant={field.value.includes(time.value) ? 'default' : 'outline'}
													className={cn(
														field.value.includes(time.value) &&
															'bg-primary text-primary-foreground',
														check && 'opacity-50 cursor-not-allowed'
													)}
													disabled={check}
													onClick={() => {
														if (!check) {
															const updatedValue = field.value.includes(time.value)
																? field.value.filter((v) => v !== time.value)
																: [...field.value, time.value];
															field.onChange(updatedValue.sort());
														}
													}}>
													{time.label}
												</Button>
											);
										})}
									</div>
								</FormControl>
								<FormDescription>Select one or more available time slots</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='col-span-full'>
						<Label>Total Price</Label>
						<Input readOnly value={formatCurrency(court.price * form.watch('timetables').length)} />
					</div>

					<div className='col-span-full'>
						<Button type='submit' disabled={loading}>
							{loading && <Loader2 className='size-5 animate-spin' />}
							Submit
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};
