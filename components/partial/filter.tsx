'use client';

import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sizeOptions, typeOptions } from '@/lib/constant';
import { useRouter, useSearchParams } from 'next/navigation';

import { Label } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { useLocations } from '@/hooks/use-locations';

interface FilterProps {
	className?: string;
}

export const Filter: React.FC<FilterProps> = ({ className }: FilterProps) => {
	const { data: locations } = useLocations();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [params, setParams] = React.useState<{
		location: string;
		type: string;
		size: string;
	}>({
		location: searchParams.get('location') || 'all',
		type: searchParams.get('type') || 'all',
		size: searchParams.get('size') || 'all',
	});

	// React.useEffect(() => {
	// 	const search = new URLSearchParams();

	// 	search.set('location', params.location);
	// 	search.set('type', params.type);
	// 	search.set('size', params.size);

	// 	const out = search.toString();
	// 	router.push('?' + out);
	// }, [params, router]);

	return (
		<div
			className={cn(
				'border lg:border-white/20 p-6 rounded-xl bg-card lg:bg-white/20 relative backdrop-blur-sm',
				className
			)}>
			<div className='grid lg:grid-cols-3 gap-6 items-end'>
				<div>
					<Label className='mb-1 block text-sm font-medium'>Court Location</Label>
					<Select onValueChange={(value) => setParams({ ...params, location: value })} defaultValue={params.location}>
						<SelectTrigger className='lg:bg-white/20 lg:border-white/20 focus:ring-offset-0'>
							<SelectValue placeholder='Select location of the court' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All locations</SelectItem>
							{locations?.data.map((location) => (
								<SelectItem key={location.location_id} value={location.location_id.toString()}>
									{location.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='mb-1 block text-sm font-medium'>Court Type</Label>
					<Select onValueChange={(value) => setParams({ ...params, type: value })} defaultValue={params.type}>
						<SelectTrigger className='lg:bg-white/20 lg:border-white/20 focus:ring-offset-0'>
							<SelectValue placeholder='Select type of the court' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All types</SelectItem>
							{Object.entries(typeOptions).map(([key, value]) => (
								<SelectItem key={key} value={key}>
									{value}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='mb-1 block text-sm font-medium'>Court Size</Label>
					<Select onValueChange={(value) => setParams({ ...params, size: value })} defaultValue={params.size}>
						<SelectTrigger className='lg:bg-white/20 lg:border-white/20 focus:ring-offset-0'>
							<SelectValue placeholder='Select size of the court' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All sizes</SelectItem>
							{Object.entries(sizeOptions).map(([key, value]) => (
								<SelectItem key={key} value={key}>
									{value}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
};
