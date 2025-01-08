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
	const schema = z.object({
		id: z.coerce.number(),
	});

	const { data: valid, success, error } = schema.safeParse(params);
	if (!success) throw new Error(error.message);

	const { data: court } = await axios.get<SearchResponse>('/courts/' + valid.id);
	return <ReservationForm court={court.data} />;
}
