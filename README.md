# query-api
To use this library, you will first need an API key from https://buidlhub.com. Sign up, register at least 1 dApp and get your key. This will be needed to initialize the BHubClient.

## Installation
`npm install buidlhub-query-api`

## Usage
```javascript
   import {
      BHubClient,
      Filter
   } from 'buidlhub-query-api';
   
   ...
   
   //initialize the client with an api key 
   let client = await BHubClient.init({
      apiKey: <API_KEY>
   });
   
   //create a complex filter to find transactions for the Idex contract. 
   //NOTE: it is assumed that the Idex contract ABI is registered with your
   //dApp on BUIDLHub.
   
   //here we want to filter out transactions that are either successful and depositToken calls OR transactions that 
   //have a Deposit or Withdraw event with specific attributes.
   let filter = Filter.or([
      Filter.and([
        //only transactions where the function is 'depositToken' for a specific token address
        Filter.functionQuery({
          name: 'depositToken',
          params: {
            token: "0x50ee674689d75c0f88e8f83cfe8c4b69e8fd590d"
          }
        }),
        
        //only transactions that succeeded
        Filter.fields({
          status: true
        })
      ]),
      Filter.or([
        //or transactions that have a 'Withdraw' event with a specific token attribute
        Filter.eventQuery({
          name: "Withdraw",
          attributes: {
            token: "0x1844b21593262668b7248d0f57a220caaba46ab9"
          }
        }),
        //or transactions that have a 'Deposit' event with a specific token attribute
        Filter.eventQuery({
          name: "Deposit",
          attributes: {
            token: "0x50ee674689d75c0f88e8f83cfe8c4b69e8fd590d"
          }
        })
      ])
    ]);

    //create a query
    let query = client.query({
    
      //for these contract addresses
      contracts: [
        '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208'
      ],
      
      //using the filter created above
      filter,
      
      //paging with 10 results per page
      limit: 10,
      
      //starting at page 0
      offset: 0
    });
    
    //execute async and get the results
    let results = await query.execute();
    
    //results.total holds total number of items that can be paged through
    //results.hits are the transactions of interest
    
```
# Limits
Currently, accounts are limited to 3 queries per second. Once that rate is exceeded, status code 429 is returned until the rate goes back down. 

# API

## Client
The BUIDLHub client connector is the entry point for any query activity. It must first be initialized with an API key from BUIDLHub. Once initialized, it is safe to use the client instance for multiple asynchronous calls. The client uses JWT tokens
so a best practice is to initialize the client and then use the BHubClient.instance() function to retrieve a singleton of
the client. This will reuse the token and make subsequent query calls more efficient. Tokens are good for 24 hours so a long-running process will see a performance blip when a token requires refresh.

```javascript
  const client = await BHubClient.init({ apiKey: APIKEY });
  ...
  //in some other code...
  let client = await BHubClient.instance();
  let r = await client.query({...}).execute();
```

Why is instance and init asynchronous? Because in both cases, if the JWT token is stale, it will be refreshed before 
returning the client instance. This simplifies your code so that you don't have to keep checking whether the client is connected, etc.

## Filter
Filters help narrow down the transactions you want to retrieve. At least one filter is currently required in every search.

### Filter Groups
Filters can include AND and OR groupings to apply boolean logic to a subset of criteria. 
```javascript
   //an OR grouping where any Filter in the given array being true makes the filter true overall
   Filter.or([...])
   
   //an AND grouping where ALL Filters in the given array must be true for the filter to pass
   Filter.and([...])
```

### Filter Fields
The simplest filter is based on a transaction's field data. The format is basically an Object whose property names represent the field to filter on and their values are the criteria to use for those fields. Future version may apply ranges to fields 
but right now, it is a direct match.

```javascript
   Filter.fields({
      blockNumber: 7000000,
      status: true
   });
```

The possible fields are outlined below:

* __blockNumber__: specific block number
* __status__: transaction's success/fail status (true, false)
* __from__: transaction's sender address (as 0x-prefixed address string)
* __gasLimit__: sender-specified gas limit (number)
* __gasUsed__: amount of gas used for the transaction (number)
* __gasPrice__: sender-specified gas price in wei (string)
* __hash__: transaction hash (string)
* __value__: value attached to a transaction in wei (string)
* __valueGwei__: value attached to a transaction expressed in gwei (string or number)
* __cost__: the pre-computed cost of a transaction in wei (string)
* __costEth__: the pre-computed cost of a transaction in eth (number)

### Function Filter
You can also filter for a specific function and its parameters. Here is an example looking for any transaction 
for the 'buyToken' function of a specific amount:

```javascript
   Filter.functionQuery({
    name: 'buyToken',
    params: {
      amount: "100000000"
    }
   });
```
Function filters require that you first register associated contract ABI with the dApp on BUIDLHub. If no ABI is found, the function filter will be ignored as part of the filter criteria.

### Event Filter
You can filter by event name and any of its attributes. Here is an example looking for any transaction
with a 'SwapComplete' event for a specific token pair:
```javascript
    Filter.eventQuery({
      name: "Deposit",
      attributes: {
         srcToken: "0x50ee674689d75c0f88e8f83cfe8c4b69e8fd590d",
         dstToken: "0x1844b21593262668b7248d0f57a220caaba46ab9"
      }
    })
```
Event filters require that you first register associated contract ABI with the dApp on BUIDLHub. If no ABI is found, the function filter will be ignored as part of the filter criteria.

## Query Properties
In addition to a filter field, queries have several other fields to specify what to retrieve from the BUIDLHub data store. 

### timeRange
You can specific a time range object with 'start' and 'end' properties in seconds or milliseconds. The range cannot exceed the max allowed time range for your BUIDLHub account (currently set at 7 days). If not timeRange is set, 7 days is used.
```javascript
   let q = client.query({
      timeRange: {
         start: 1546549639,
         end: 1546559000
      },
      ...
   });
```

### contracts
An array of contract addresses, in 0x-prefixed hex-string format. These will be used to match against the transaction's 'to' field. It is advised to only use contract addresses defined in your dApp so that you get proper ABI decoding. Otherwise, results will vary.
```javascript
   let q = client.query({
     contracts: ['0x06012c8cf97bead5deae237070f9587f8e7a266d'],
     ...
   })
```

### limit
The number of transactions to return as a 'page' of results. If doing automated page queries to retrieve a bunch of transactions, keep in mind the query threshold limit of 3/sec.

### offset
The 'page' offset to get the next batch of transactions.

## Results
Results returned from queries will have a specific schema as follows:
```javascript
  {
    blockNumber: <number>,
    timestamp: <number in seconds>,
    from: <string address>,
    input: <txn input data hex string>,
    gasLimit: <number>,
    gasPriceGwei: <number>,
    gasUsed: <number>,
    transactionHash: <hex string>,
    transactionIndex: <number>,
    to: <contract address>
    value: <string in wei>,
    status: <boolean>,
    costEth: <number>,
    function: {
      name: <string>,
      params: [
         { 
           name: <string>,
           value: <string>
         }
      ]
    },
    logEvents: [
       {
         name: <string>,
         attributes: [
            {
              name: <string>,
              value: <string>
            }
         ]
       }
    ]
 }
```
