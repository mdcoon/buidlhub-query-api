import axios from 'axios';
import * as yup from 'yup';


const postSchema = yup.object({
  token: yup.string().required(),
  url: yup.string().required(),
  data: yup.mixed().required()
})

const BASE_URL = "https://buidlhub.com/api";

export default class Connector {

  async get(url, token) {
    if(!url.startsWith(BASE_URL)) {
      if(url.startsWith("/")) {
        url = url.substring(1);
      }
      url = `${BASE_URL}/${url}`
    }
    let headers = undefined;
    if(token) {
      headers = {'Authorization': ('Bearer ' + token)};
    }
    let res = await axios({
      method: "GET",
      headers,
      url
    });
    return res.data;
  }

  post(props) {
    return new Promise((done,err)=>{
      this._post({
        count: 0,
        retries: 10,
        cb: (e, ctx, res) => {
          if(e) {
            if(ctx.count >= ctx.retries) {
              //timeout
              err(e)
            } else if(e.response && e.response.status === 429) {
              console.log("Throttling requests...");
              //only retries if throttling requests
              let waitTime = (ctx.count+1) * 1000;
              setTimeout(()=>{
                this._post({
                  ...ctx,
                  count: ctx.count + 1
                }, props);
              }, waitTime);
            } else {
              err(e);
            }
          } else {
            done(res);
          }
        }
      }, props);
    });
  }

  async _post(ctx, props) {
    postSchema.validateSync(props);
    let headers = {'Authorization': ('Bearer ' + props.token)};
    let url = props.url;
    let data =props.data;
    if(!url.startsWith(BASE_URL)) {
      if(url.startsWith("/")) {
        url = url.substring(1);
      }
      url = `${BASE_URL}/${url}`
    }

    try {
      let res = await axios({
        method: 'POST',
        headers,
        url,
        data
      });
      ctx.cb(null, ctx, res.data);
    } catch(e) {
      ctx.cb(e, ctx);
    }
  }

  stale(token) {
    if(!token) {
      return true;
    }

    let payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let exp = payload.exp*1000;
    let now = Date.now();
    return exp < now;
  }
}
