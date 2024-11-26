import * as React from 'react';

import Link from 'next/link';
import { Logo } from '../logo';
import { ThemeToggle } from '../theme-toggle';
import { cn } from '@/lib/utils';

interface NavbarProps {
	className?: string;
}

const menus = [
	{
		label: 'Courts',
		href: '/courts',
	},
	{
		label: 'Locations',
		href: '/locations',
	},
	{
		label: 'About',
		href: '/about',
	},
];

export const Navbar: React.FC<NavbarProps> = ({ className }: NavbarProps) => {
	return (
		<nav className={cn('py-4', className)}>
			<div className='flex items-center justify-between'>
				<Link href='/' className='flex items-center gap-2'>
					<Logo className='size-6' />
					<span className='font-display font-bold text-xl'>{process.env.NEXT_PUBLIC_APP_NAME}</span>
				</Link>

				<ul className='flex gap-4 items-center'>
					{menus.map((menu) => (
						<li key={menu.label}>
							<Link href={menu.href} className='font-medium'>
								{menu.label}
							</Link>
						</li>
					))}
					<ThemeToggle />
				</ul>
			</div>
		</nav>
	);
};
