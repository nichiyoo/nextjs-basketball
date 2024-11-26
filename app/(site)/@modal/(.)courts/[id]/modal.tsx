'use client';

import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useRouter } from 'next/navigation';

const Modal: React.FC<React.PropsWithChildren> = ({ children }) => {
	const router = useRouter();

	return (
		<Dialog
			defaultOpen
			onOpenChange={(open) => {
				if (!open) router.back();
			}}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Create Rerservation</DialogTitle>
					<DialogDescription>Complete your reservation details</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
};

export default Modal;
