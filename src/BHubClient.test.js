import {assert} from 'chai';
import BHubClient from './BHubClient';
import Filter from './Filter';

const encodeToken = exp => {
  let header = Buffer.from(JSON.stringify({header: true}));
  let body = Buffer.from(JSON.stringify({exp}));
  return header.toString('base64') + "." + body.toString('base64');
}

class TestConn {
  constructor(props) {
    this.expiration = props.expiration;
    this.isStale = false;
    this.postHandler = props.postHandler;
    this.connected = false;
  }

  async get(url, token) {
    if(url.indexOf('apiAccess') > 0) {
      this.connected = true;
      this.isStale = false;
      return {token: encodeToken(this.expiration)}
    }
    return {};
  }

  async post(props) {
    return this.postHandler(props);
  }

  stale() {
    return this.isStale;
  }
}

describe("BHubClient", ()=>{
  it("should connect if not connected", done => {
    let conn = new TestConn({
      expiration: Date.now() + 500,
      postHandler: data => {}
    });
    BHubClient.init({
      apiKey: 'test',
      connector: conn
    }).then((client)=>{
      assert(conn.connected, "Did not connect on init");
      done();
    })

  });

  it("should reconnect if token stale", done=>{
    let conn = new TestConn({
      expiration: Date.now() + 500,
      postHandler: data => {
        console.log("Posted token", data.token);
      }
    });

    BHubClient.init({
      apiKey: 'test',
      connector: conn
    }).then((client)=>{
      client.connector.connected = false;
      client.connector.isStale = true;
      let filter = Filter.fields({status: true});

      let q = client.query({
        contracts: ['0x1234'],
        filter
      });
      q.execute().then(()=>{
        assert(client.connector.connected, "Should have reconnected");
        done();
      }).catch(e=>{
        assert(false, e.message);
      })
    })

  });
})
