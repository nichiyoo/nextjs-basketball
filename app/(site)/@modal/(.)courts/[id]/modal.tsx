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
			<DialogContent className='max-w-3xl max-h-[60vh] overflow-y-scroll scrollbar-none p-8'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-semibold'>Create Rerservation</DialogTitle>
					<DialogDescription>Complete your reservation details</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
};

export default Modal;
