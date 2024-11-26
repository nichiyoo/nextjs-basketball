'use client';

import * as React from 'react';

import { Filter } from '@/components/partial/filter';
import Image from 'next/image';
import { Navbar } from '@/components/partial/navbar';
import { cn } from '@/lib/utils';
import { useSelectedLayoutSegment } from 'next/navigation';

interface LayoutProps {
	modal: React.ReactNode;
	children: React.ReactNode;
}

export default function Layout({ modal, children }: LayoutProps) {
	const segment = useSelectedLayoutSegment();

	return (
		<main className='relative'>
			<div className='relative overflow-hidden'>
				<div className='z-10 container max-w-6xl relative'>
					<Navbar className='text-white' />

					<div
						className={cn('py-20', {
							'pb-64': segment !== 'courts',
						})}>
						<div className='flex flex-col space-y-8'>
							<div className='text-white motion-preset-slide-up'>
								<h1 className='mb-2 text-7xl font-bold font-display'>Your Game, Your Court, Your Way</h1>
								<p className='opacity-60'>
									Elevate your basketball experience with courts designed for players like you. Our platform lets you
									search, compare, and book basketball courts that match your game - no matter if it&apos;s indoor or
									outdoor. Plan your next pickup game, team practice, or tournament with confidence.
								</p>
							</div>
						</div>
					</div>
				</div>

				<Image alt='Banner' src='/background.jpg' className='absolute w-full object-cover object-center' fill />
				<div className='absolute inset-0 z-0 bg-gradient-to-t from-black to-transparent' />
			</div>

			{modal}

			<section
				className={cn('container max-w-6xl', {
					'py-20': segment !== null,
				})}>
				{children}
			</section>
		</main>
	);
}
