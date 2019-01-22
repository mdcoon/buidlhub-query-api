import {propsCheck} from './utils';
import _ from 'lodash';
import Query from './Query';
import * as  yup from 'yup';
import Connector from './Connector';

const schema = yup.object({
  apiKey: yup.string().required(),
  connector: yup.mixed()
});


const ACCESS_URL = `/api/auth/apiAccess`;
const QUERY_URL = `/api/cache/query`;

let inst = null;

export default class BHubClient {

  static async init(props) {

    if(!inst) {
      inst = new BHubClient(props);
    }
    if(!inst.connected || inst.stale()) {
      await inst.connect();
    }
    return inst;
  }

  static async instance() {
    if(!inst) {
      throw new Error("Must initialize BHub client first");
    }
    if(!inst.connected || inst.stale()) {
      await inst.connect();
    }
    return inst;
  }

  constructor(props) {
    schema.validateSync(props);

    this.apiKey = props.apiKey;
    this.connector = props.connector;
    if(!this.connector) {
      this.connector = new Connector();
    }

    this.connected = false;
    [
      'connect',
      'stale',
      'query',
      'count',
      '_runQuery'
    ].forEach(fn=>{
      this[fn] = this[fn].bind(this);
    });
  }

  async connect() {
    let url = `${ACCESS_URL}/${this.apiKey}`;

    let res = await this.connector.get(url);
    let token = res.token;
    if(!token) {
      throw new Error("Could not connect to BUIDLHub for access token");
    }
    this.token = token;
    this.connected = true;
  }

  stale()  {
    return this.connector.stale(this.token);
  }

  query(props) {
    return new Query({
      ...props,
      client: this
    });
  }

  count(props) {
    return new Query({
      ...props,
      client: this,
      count: true
    });
  }

  async _runQuery(query) {
    let url = QUERY_URL;

    if(this.stale()) {
      await this.connect();
    }
    let res = await this.connector.post({
      url,
      token: this.token,
      data: {
        ...query,
        client: undefined
      }
    });
    return res;
  }
}
