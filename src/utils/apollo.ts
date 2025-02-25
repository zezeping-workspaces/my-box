import { createClient } from 'graphql-ws';

export const client = createClient({
	url: 'wss://zezeping.com/gateway/graphql/ws',
	// connectionParams: {
	// 	authToken: 'your-auth-token', // 可选，认证信息
	// },
});

export default client