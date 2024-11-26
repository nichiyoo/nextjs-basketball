import { Court } from '@/lib/type';
import { fetcher } from '@/lib/axios';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';

export const useCourts = () => {
	const { toast } = useToast();

	return useSWR<{
		message: string;
		data: Array<
			Court & {
				location: Location;
			}
		>;
	}>('/courts', fetcher, {
		revalidateOnFocus: true,
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
			});
		},
	});
};
