import "babel-polyfill";
import {
  Client,
  Filter
} from 'buidlhub-query-api';

/**
  * This example assumes you have already registered with BUIDLHub, you
  * added a dApp and have its API key, and you added the IDEX contract information
  * to your dapp.
**/
const apiKey = "<ENTER_API_KEY>";


const main = async () => {

  let client = await Client.init({
    apiKey
  });

  let filter = Filter.or([
    Filter.and([
      Filter.functionQuery({
        name: 'depositToken',
        params: {
          token: "0x50ee674689d75c0f88e8f83cfe8c4b69e8fd590d"
        }
      }),
      Filter.fields({
        status: true
      })
    ]),
    Filter.or([
      Filter.eventQuery({
        name: "Withdraw",
        attributes: {
          token: "0x1844b21593262668b7248d0f57a220caaba46ab9"
        }
      }),
      Filter.eventQuery({
        name: "Deposit",
        attributes: {
          token: "0x50ee674689d75c0f88e8f83cfe8c4b69e8fd590d"
        }
      })
    ])
  ]);

  let query = client.query({
    contracts: [
      '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208'
    ],
    filter,
    limit: 10,
    offset: 0
  });
  query.execute()
  .then((r)=>{
    if(r.error) {
      errCnt++;
    } else {
      okCnt++;
    }
    console.log("Query complete", r);
  });
}

main()
.then(()=>{
  console.log("Done");
})
.catch(e=>{
  console.log("Error", e);
});
