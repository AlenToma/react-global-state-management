import {defineMethod} from './defineProp'
export default function createData(dt, onCreate, trigger, key) {
  const pr = Array.prototype;
  const prCopy = new Array();
  
  let created = false;
  defineMethod(prCopy, 'getKey', () => key);
  defineMethod(prCopy, 'getType', () => 'CustomeArray'); 
  defineMethod(prCopy, 'push', function (...data) {
    const oValue = [...this];
    const r = pr.push.call(this, ...onCreate(this.getKey(), data));
    if (oValue.length !== this.length && created)
      trigger(this.getKey(), oValue, this);
    return r;
  });

  defineMethod(prCopy, 'concat', function (...data) {
    return pr.concat.call(this, ...onCreate(this.getKey(), data));
  });

  defineMethod(prCopy, 'shift', function () {
    const oValue = [...this];
    const r = pr.shift.call(this);
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this); 
    return r;
  });

  defineMethod(prCopy, 'unshift', function (...data) {
    const oValue = [...this];
    const r = pr.unshift.call(this, ...onCreate(this.getKey(), data));
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  });

  defineMethod(prCopy, 'pop', function () {
    const oValue = [...this];
    const r = pr.pop.call(this);
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  });

  defineMethod(prCopy, 'slice', function (start, end) {
    const oValue = [...this];
    const r = pr.slice.call(this, start, end);
    trigger(this.getKey(), oValue, this);
    return r;
  });

  defineMethod(prCopy, 'slice', function (start, deleteCount, ...data) {
    const oValue = [...this];
    const r = pr.splice.call(
      this,
      start,
      deleteCount,
      ...onCreate(this.getKey(), data)
    );
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this); 
    return r;
  });   
  if (dt) dt.forEach((x) => prCopy.push(x));
  created = true;
  return prCopy;
}
