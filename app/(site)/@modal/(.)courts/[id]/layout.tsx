import * as React from 'react';

import Modal from './modal';

export default async function Layout({ children }: React.PropsWithChildren): Promise<React.JSX.Element> {
	return <Modal>{children}</Modal>;
}
