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
