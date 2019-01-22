import Filter, {filterSchema} from './Filter';
import {empty, _throw} from './utils';
import * as yup from 'yup';

import _ from 'lodash';

const schema = yup.object({
  client: yup.mixed().required(),
  contracts: yup.array().of(yup.string().max(42).matches(/^0x/)).required(),
  filter: filterSchema.clone().required(),
  groupBy: yup.string().max(50),
  timeRange: yup.object({
    start: yup.number().positive().integer(),
    end: yup.number().positive().integer()
  }),
  limit: yup.number().positive().integer(),
  offset: yup.number().moreThan(-1).integer(),
  count: yup.boolean()
});

/**
  * Query class. This is created by the BHubClient but is also possible
  * to create directly.
  */
export default class Query {
  constructor(props) {
    schema.validateSync(props);
    this.client = props.client;
    this.contracts = props.contracts;
    this.filter = props.filter;

    //all extra fields
    this.groupBy = props.groupBy;
    this.limit = props.limit || 10;
    this.offset = props.offset || 0;
    this.count = props.count;
    this.timeRange = props.timeRange;
    if(props.timeRange && props.timeRange.start > props.timeRange.end ) {
      _throw("Query", "range start must be before range end");
    }

    [
      'execute'
    ].forEach(fn=>{
      this[fn] = this[fn].bind(this);
    });
  }

  /**
    * Execute the query (async).
  */
  execute() {
    schema.validateSync(this);
    return this.client._runQuery(this);
  }
}
