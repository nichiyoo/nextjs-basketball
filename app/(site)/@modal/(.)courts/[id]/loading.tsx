import * as React from 'react';

import { Loader } from 'lucide-react';

export default async function Loading(): Promise<React.JSX.Element> {
	return (
		<div className='h-screen flex flex-col items-center justify-center'>
			<Loader className='size-10 text-primary animate-spin' />
		</div>
	);
}
