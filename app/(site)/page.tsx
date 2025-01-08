import * as React from 'react';

import { Court, Location } from '@/lib/type';

import { CourtGrid } from '@/components/court/court-grid';
import axios from '@/lib/axios';

interface PageProps {
	searchParams: {
		location: string;
		type: string;
		size: string;
	};
}

type SearchResponse = {
	message: string;
	data: Array<
		Court & {
			location: Location;
		}
	>;
};

export default async function Page({ searchParams }: PageProps): Promise<React.JSX.Element> {
	const { data: courts } = await axios.get<SearchResponse>('/search', {
		params: {
			...searchParams,
		},
	});

	return <CourtGrid courts={courts.data} />;
}
