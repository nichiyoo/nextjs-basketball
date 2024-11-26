import * as React from 'react';

import { Court, Location } from '@/lib/type';
import { CourtSize, CourtType, sizeOptions, typeOptions } from '@/lib/constant';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CourtCardProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	court: Court & {
		location: Location;
	};
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, className, ...props }) => {
	return (
		<div className={cn('border border-border rounded-xl overflow-hidden relative bg-card', className)} {...props}>
			<Image
				src={court.image}
				alt={court.name}
				width={600}
				height={600}
				className='w-full aspect-thumbnail object-cover'
			/>

			<div className='absolute top-0 right-0 m-4'>
				<div className='text-sm bg-primary rounded-lg px-2 py-1 text-white font-medium flex items-center gap-1'>
					<span>${court.price}</span>
					<span>/</span>
					<span>hour</span>
				</div>
			</div>

			<div className='flex flex-col space-y-4 p-6'>
				<div className='flex flex-col'>
					<h3 className='font-semibold line-clamp-1'>{court.name}</h3>
					<p className='text-muted-foreground line-clamp-2'>{court.description}</p>
				</div>

				<div className='flex items-center justify-between text-sm'>
					<span>{typeOptions[court.type as CourtType]}</span>
					<span>{sizeOptions[court.size as CourtSize]}</span>
				</div>
			</div>
		</div>
	);
};
