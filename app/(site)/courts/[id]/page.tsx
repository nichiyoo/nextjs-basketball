import * as React from 'react';
import * as z from 'zod';

import { Court, Location } from '@/lib/type';

import { ReservationForm } from '@/components/reservation/form';
import axios from '@/lib/axios';

interface PageProps {
	params: {
		id: string;
	};
}

type CourtWithLocation = Court & { location: Location };
type SearchResponse = { message: string; data: CourtWithLocation };

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
	const {
		data: valid,
		success,
		error,
	} = z
		.object({
			id: z.coerce.number(),
		})
		.safeParse(params);

	if (!success) throw new Error(error.message);
	const { data: court } = await axios.get<SearchResponse>('/courts/' + valid.id);

	return (
		<div>
			<div className='mb-4'>
				<h1 className='font-semibold text-3xl'>Create Rerservation</h1>
				<p className='text-muted-foreground'>Complete your reservation details</p>
			</div>

			<ReservationForm court={court.data} />
		</div>
	);
}
