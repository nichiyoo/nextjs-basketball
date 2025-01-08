import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Court, Location } from '@/lib/type';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { formatCurrency } from '@/lib/utils';

interface CourtDetailsCardProps {
	court: Court & {
		location: Location;
	};
}

export function CourtDetailsCard({ court }: CourtDetailsCardProps) {
	const details = [
		{ field: 'Court Name', value: court.name },
		{ field: 'Location', value: court.location.name },
		{ field: 'Size', value: court.size },
		{ field: 'Type', value: court.type },
		{ field: 'Price', value: formatCurrency(court.price) },
		{ field: 'Description', value: court.description },
	];

	return (
		<Card>
			<CardContent className='p-0'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-field'>Field</TableHead>
							<TableHead>Details</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{details.map((detail) => (
							<TableRow key={detail.field}>
								<TableCell className='py-2 font-medium'>{detail.field}</TableCell>
								<TableCell className='py-2'>{detail.value}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
