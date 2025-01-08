import * as React from 'react';

import { Loader } from 'lucide-react';

export default async function Loading(): Promise<React.JSX.Element> {
	return (
		<div className='flex items-center justify-center h-[48vh]'>
			<Loader className='size-10 text-primary animate-spin' />
		</div>
	);
}
