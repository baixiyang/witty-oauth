// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import axios, { AxiosResponse } from 'axios';
import { message } from '../util';

export const request = axios.create({});
request.interceptors.response.use(
  (res: AxiosResponse) => {
    return res.data;
  },
  (error: any) => {
    if (error?.response?.data?.error) {
      message.error(
        error.response.data.error_description || error.response.data.error
      );
    } else if (error?.message) {
      message.error(error.message);
    } else {
      message.error('unknownError');
    }
  }
);

export const login = (data: {
  username: string;
  password: string;
}): Promise<{ redirect_uri: string }> => {
  return request.post('/auth/login', data);
};
