import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TotalPriceProps {
	price: number;
	selectedSlots: number;
}

export function TotalPrice({ price, selectedSlots }: TotalPriceProps) {
	const total = price * selectedSlots;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Total Price</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-2xl font-bold'>${total.toFixed(2)}</p>
				<p className='text-sm text-muted-foreground'>
					${price.toFixed(2)} x {selectedSlots} time slot{selectedSlots !== 1 ? 's' : ''}
				</p>
			</CardContent>
		</Card>
	);
}
