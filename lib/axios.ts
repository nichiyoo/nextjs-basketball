import base, { AxiosRequestConfig } from 'axios';

export const { isAxiosError } = base;

const axios = base.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
	const [url, config] = Array.isArray(args) ? args : [args];
	const { data } = await axios.get(url, {
		...config,
	});
	return data;
};

export default axios;
