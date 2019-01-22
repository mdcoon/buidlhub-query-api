import {_throw} from './utils';
import _ from 'lodash';
import * as yup from 'yup';

export const filterSchema = yup.object({
  joiner: yup.string().oneOf(["and", "or"]).notRequired(),

  filters: yup.lazy(()=>{
    return yup.array().notRequired().of(filterSchema.default(undefined))
  }),

  functionQuery: yup.object({
    name: yup.string().max(50),
    params: yup.array().of(
      yup.mixed()
    ).nullable()
  }),

  eventQuery: yup.object({
    name: yup.string().max(50),
    attributes: yup.array().of(
      yup.mixed()
    ).nullable()
  }),

  fields: yup.mixed().nullable()

});

export default class Filter {

  static or(filters) {
    let f = new Filter({
      joiner: 'or',
      filters
    });
    filterSchema.validateSync(f);
    return f;
  }

  static and(filters) {
    let f = new Filter({
      joiner: 'and',
      filters
    });
    filterSchema.validateSync(f);
    return f;
  }

  static functionQuery(spec) {
    //couldn't figure out the syntax needed for name validation on a
    //not-required field
    if(!spec.name) {
      _throw("functionQuery", "name is required");
    }
    let f = new Filter({
      functionQuery: spec
    });
    filterSchema.validateSync(f);
    return f;
  }

  static eventQuery(spec) {
    //couldn't figure out the syntax needed for name validation on a
    //not-required field
    if(!spec.name) {
      _throw("eventQuery", "name is required");
    }
    let f = new Filter({
      eventQuery: spec
    });
    filterSchema.validateSync(f);
    return f;
  }

  static fields(spec) {
    let f = new Filter({
      fields: spec
    });
    filterSchema.validateSync(f);
    return f;
  }

  constructor(props) {
    this.joiner = props.joiner;
    this.filters = props.filters;
    this.functionQuery = props.functionQuery;
    this.eventQuery = props.eventQuery;
    this.fields = props.fields;
    if(!this.filters &&
       !this.functionQuery &&
       !this.eventQuery &&
       !this.fields) {
      _throw("Filter", "Requires at least sub-filters, a functionQuery, an eventQuery, or fields");
    }
  }
}
