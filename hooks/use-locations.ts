import { Location } from '@/lib/type';
import { fetcher } from '@/lib/axios';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';

export const useLocations = () => {
	const { toast } = useToast();

	return useSWR<{
		message: string;
		data: Array<Location>;
	}>('/locations', fetcher, {
		revalidateOnFocus: true,
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
			});
		},
	});
};
