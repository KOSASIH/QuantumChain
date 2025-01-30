# QuantumChain API Reference

## Introduction

The QuantumChain API provides a set of endpoints for interacting with the QuantumChain blockchain. This documentation outlines the available API endpoints, their functionalities, and how to use them.

## Base URL

All API requests are made to the following base URL:

https://api.quantumchain.io/v1


## Authentication

Most API endpoints require authentication. You can obtain an API key by registering on the QuantumChain platform. Include the API key in the request headers as follows:

Authorization: Bearer YOUR_API_KEY


## Endpoints

### 1. Get Block Information

- **Endpoint**: `/blocks/{blockId}`
- **Method**: `GET`
- **Description**: Retrieves information about a specific block in the blockchain.

#### Request

```http
GET /blocks/{blockId}
Authorization: Bearer YOUR_API_KEY
```

### Parameters
| Name | Type | Description | |----------|--------|---------------------------------| | blockId | string | The ID of the block to retrieve.|

Response
```json
1 {
2   "blockId": "123456",
3   "previousBlockId": "123455",
4   "timestamp": "2023-10-01T12:00:00Z",
5   "transactions": [
6     {
7       "transactionId": "tx123",
8       "from": "address1",
9       "to": "address2",
10       "amount": 100,
11       "status": "confirmed"
12     }
13   ],
14   "miner": "minerAddress",
15   "difficulty": 2,
16   "nonce": 123456
17 }
```

### 2. Send Transaction
- Endpoint: /transactions/send
- Method: POST
- Description: Sends a new transaction to the blockchain.

Request
```http
1 POST /transactions/send
2 Authorization: Bearer YOUR_API_KEY
3 Content-Type: application/json
```

Body
```json
1 {
2   "from": "senderAddress",
3   "to": "recipientAddress",
4   "amount": 100,
5   "fee": 0.01,
6   "data": "optional data"
7 }
```

Response
```json
1 {
2   "transactionId": "tx123",
3   "status": "pending",
4   "message": "Transaction submitted successfully."
5 }
```

### 3. Get Transaction Status
- Endpoint: /transactions/{transactionId}
- Method: GET
- Description: Retrieves the status of a specific transaction.

Request
```http
1 GET /transactions/{transactionId}
2 Authorization: Bearer YOUR_API_KEY
```

#### Parameters
| Name | Type | Description | |----------------|--------|--------------------------------------| | transactionId | string | The ID of the transaction to retrieve.|

Response
```json
1 {
2   "transactionId": "tx123",
3   "status": "confirmed",
4   "blockId": "123456",
5   "timestamp": "2023-10-01T12:00:00Z",
6   "from": "address1",
7   "to": "address2",
8   "amount": 100,
9   "fee": 0.01
10 }
```

### 4. Get Account Balance
- Endpoint: /accounts/{address}/balance
- Method: GET
- Description: Retrieves the balance of a specific account.

Request
```http
1 GET /accounts/{address}/balance
2 Authorization: Bearer YOUR_API_KEY
```

#### Parameters
| Name | Type | Description | |----------|--------|---------------------------------| | address | string | The address of the account to retrieve the balance for.|

Response
```json
1 {
2   "address": "address1",
3   "balance": 1000,
4   "currency": "QTC"
5 }
```

### 5. Get Network Status
- Endpoint: /network/status
- Method: GET
- Description: Retrieves the current status of the network.

Request
```http
1 GET /network/status
2 Authorization: Bearer YOUR_API_KEY
```

Response
```json
1 {
2   "status": "online",
3   "peerCount": 50,
4   "blockHeight": 123456,
5   "lastBlockTime": "2023-10-01T12:00:00Z"
6 }
```

## Error Handling
The API returns standard HTTP status codes to indicate the success or failure of a request. Common error responses include:

- 400 Bad Request: The request wasinvalid or malformed.
- 401 Unauthorized: Authentication failed or API key is missing.
- 404 Not Found: The requested resource could not be found.
- 500 Internal Server Error: An unexpected error occurred on the server.

## Rate Limiting
To ensure fair usage of the API, rate limits are enforced. Each API key is limited to a certain number of requests per minute. Exceeding this limit will result in a 429 Too Many Requests response.

## Conclusion
This API reference provides a comprehensive guide to interacting with the QuantumChain blockchain. For further assistance or to report issues, please contact the QuantumChain support team or visit the QuantumChain GitHub Repository.
