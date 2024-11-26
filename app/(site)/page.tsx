import * as React from 'react';

import { Court, Location } from '@/lib/type';

import { CourtGrid } from '@/components/court/court-grid';
import { Filter } from '@/components/partial/filter';
import axios from '@/lib/axios';

interface PageProps {
	searchParams: {
		location: string;
		type: string;
		size: string;
	};
}

type CourtWithLocation = Court & { location: Location };
type SearchResponse = { message: string; data: Array<CourtWithLocation> };

export default async function Page({ searchParams }: PageProps): Promise<React.JSX.Element> {
	const { data: courts } = await axios.get<SearchResponse>('/search', {
		params: {
			...searchParams,
		},
	});

	return (
		<React.Fragment>
			<Filter className='lg:text-white -mt-44 z-50 motion-preset-slide-up motion-delay-200' />
			<div className='py-20 lg:py-32 motion-preset-blur-up motion-delay-200'>{<CourtGrid courts={courts.data} />}</div>
		</React.Fragment>
	);
}
