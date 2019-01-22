const empty = v => {
  if( (typeof v === 'undefined') || v === null ) {
    return true;
  }
  if(typeof v === 'string') {
    return v.trim().length === 0;
  }
  return false;
}


const _throw = (ctx,msg) => {
  throw new Error(`Context: '${ctx}' Message: ${msg}`);
}

const isType = (v, t) => {
  if(t === 'number') {
    return !isNaN(v);
  }

  return typeof v === t;
}

const propsCheck = (props, required, context) => {
  if(!props && required) {
    _throw(context, "No properties provided");
  }

  if(typeof props !== 'object') {
    _throw(context, "Properties must be an object");
  }

  required.forEach(rp=>{
    let name = rp;
    if(rp.name) {
      name = rp.name;
    }
    let v = props[name];
    if(empty(v)) {
      _throw(context, "Missing property " + name);
    }
    if(rp.type) {
      if(!isType(v, rp.type)) {
        _throw(context, "Property " + name + " must be type: " + rp.type + " but is " + typeof v);
      }
    }
  });
}

export {
  empty,
  propsCheck,
  _throw
}
