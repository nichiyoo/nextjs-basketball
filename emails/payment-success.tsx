import * as React from 'react';

import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components';
import { formatCurrency } from '@/lib/utils';

interface PaymentSuccessEmailProps {
	customerEmail: string;
	companyDetails: {
		name: string;
		year: number;
		address: string;
	};
	orderDetails: {
		orderId: number;
		courtName: string;
		locationName: string;
		date: string;
		duration: number;
		total: number;
	};
	courtDetails: {
		type: 'indoor' | 'outdoor';
		size: 'full-court' | 'half-court';
	};
}

export const PaymentSuccessEmail = ({
	customerEmail,
	companyDetails,
	orderDetails,
	courtDetails,
}: PaymentSuccessEmailProps) => (
	<Html>
		<Head>
			<style>
				{`
					@media only screen and (max-width: 600px) {
						.container {
							width: 100% !important;
						}

						.content {
							padding: 24px !important;
						}

						.details-row {
							display: block !important;
						}
              
						.details-cell {
							display: block !important;
							width: 100% !important;
							padding-bottom: 10px !important;
						}
					}
				`}
			</style>
		</Head>
		<Preview>Your court reservation is confirmed! Get ready for an amazing game.</Preview>
		<Body style={styles.body}>
			<Container style={styles.container} className='container'>
				<Section style={styles.header}>
					<Heading style={styles.headerText}>Court Reservation Confirmed!</Heading>
					<Text style={styles.greeting}>
						Hello {customerEmail}, your payment has been processed successfully.
					</Text>
				</Section>

				<Section style={styles.detailsContainer} className='content'>
					<Heading style={styles.detailsHeading}>Reservation Details</Heading>
					<table style={styles.table}>
						<tbody>
							<tr className='details-row' style={styles.detailsRow}>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Order ID:</Text>
									<Text style={styles.value}>
										ORDER-{String(orderDetails.orderId).padStart(10, '0')}
									</Text>
								</td>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Total Amount:</Text>
									<Text style={styles.value}>{formatCurrency(orderDetails.total)}</Text>
								</td>
							</tr>
							<tr className='details-row' style={styles.detailsRow}>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Court:</Text>
									<Text style={styles.value}>{orderDetails.courtName}</Text>
								</td>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Location:</Text>
									<Text style={styles.value}>{orderDetails.locationName}</Text>
								</td>
							</tr>
							<tr className='details-row' style={styles.detailsRow}>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Date:</Text>
									<Text style={styles.value}>{new Date(orderDetails.date).toLocaleString()}</Text>
								</td>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Duration:</Text>
									<Text style={styles.value}>{orderDetails.duration} hour(s)</Text>
								</td>
							</tr>
							<tr className='details-row' style={styles.detailsRow}>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Court Type:</Text>
									<Text style={styles.value}>{courtDetails.type}</Text>
								</td>
								<td className='details-cell' style={styles.detailsCell}>
									<Text style={styles.label}>Court Size:</Text>
									<Text style={styles.value}>{courtDetails.size}</Text>
								</td>
							</tr>
						</tbody>
					</table>
				</Section>

				<Hr style={styles.hr} />

				<Section className='content'>
					<Text style={styles.footerText}>
						If you have any questions or need assistance, please don&apos;t hesitate to contact our support
						team.
					</Text>
					<Text style={styles.footerText}>Thank you for choosing our courts. Enjoy your game!</Text>
				</Section>

				<Hr style={styles.hr} />

				<Section className='content'>
					<Text style={styles.copyright}>
						&copy; {companyDetails.year} {companyDetails.name}. All rights reserved.
					</Text>
					<Text style={styles.copyright}>{companyDetails.address}</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

PaymentSuccessEmail.PreviewProps = {
	customerEmail: 'johndoe@example.com',
	companyDetails: {
		year: 2025,
		name: 'Basketball',
		address: '123 Main St, Anytown, AN 12345',
	},
	orderDetails: {
		orderId: 12345,
		courtName: 'Center Court',
		locationName: 'Downtown Sports Complex',
		date: '2023-06-15T14:00:00Z',
		duration: 2,
		total: 50.0,
	},
	courtDetails: {
		type: 'indoor',
		size: 'full-court',
	},
} as PaymentSuccessEmailProps;

export default PaymentSuccessEmail;

const styles = {
	body: {
		backgroundColor: '#f4f4f5',
		fontFamily:
			'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
	},
	container: {
		margin: '0 auto',
		padding: '20px 0 48px',
		width: '600px',
	},
	header: {
		backgroundColor: '#18181b',
		borderRadius: '10px 10px 0 0',
		padding: '24px',
		textAlign: 'center' as const,
	},
	headerText: {
		color: '#ffffff',
		fontSize: '24px',
		fontWeight: 'bold',
		margin: '16px 0',
	},
	greeting: {
		fontSize: '16px',
		color: '#ffffff',
		textAlign: 'center' as const,
	},
	hr: {
		borderColor: '#e4e4e7',
		margin: '20px 0',
	},
	detailsContainer: {
		backgroundColor: '#ffffff',
		borderRadius: '0 0 10px 10px',
		padding: '24px',
	},
	detailsHeading: {
		fontSize: '18px',
		fontWeight: 'bold',
		margin: '0 0 16px',
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse' as const,
	},
	detailsRow: {
		display: 'flex',
		justifyContent: 'space-between',
	},
	detailsCell: {
		width: '48%',
	},
	label: {
		color: '#71717a',
		fontSize: '14px',
		margin: '4px',
	},
	value: {
		color: '#18181b',
		fontSize: '14px',
		fontWeight: '500',
		margin: '4px',
	},
	footerText: {
		fontSize: '14px',
		lineHeight: '24px',
		margin: '8px 0',
		textAlign: 'center' as const,
	},
	copyright: {
		color: '#71717a',
		fontSize: '12px',
		lineHeight: '20px',
		margin: '4px 0',
		textAlign: 'center' as const,
	},
};
