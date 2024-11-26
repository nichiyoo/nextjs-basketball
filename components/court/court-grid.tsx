'use client';

import * as React from 'react';

import { Court, Location } from '@/lib/type';

import { CourtCard } from '@/components/court/court-card';
import Link from 'next/link';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface CourtGridProps {
	courts: Array<
		Court & {
			location: Location;
		}
	>;
}

export const CourtGrid: React.FC<CourtGridProps> = ({ courts }) => {
	const [parent] = useAutoAnimate();

	return (
		<div className='grid grid-cols-2 lg:grid-cols-4 gap-6' ref={parent}>
			{courts.map((court, index) => (
				<Link key={court.court_id} href={'/courts/' + court.court_id}>
					<CourtCard court={court} />
				</Link>
			))}
		</div>
	);
};
