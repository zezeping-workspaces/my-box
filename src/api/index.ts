import axios from 'axios'

export const fetchStocksApi = async (channel: string, codes: string[]) => {
	const query = `
      mutation stocks($channel: String!, $codes: [String!]!) {
				stocks(channel: $channel, codes: $codes) { code, name, price, detail, updateTime }
			}
    `;
	const variables = {
		channel,
		codes
	};
	// console.log(variables)
	return await axios.post('https://zezeping.com/gateway/graphql', {
		query,
		variables
	}, {
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

