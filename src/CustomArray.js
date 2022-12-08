export default function createData(dt, onCreate, trigger, key) {
  const pr = Array.prototype;
  const prCopy = new Array();
  let created = false;
  prCopy.getType = () => 'CustomeArray';
  prCopy.getKey = () => key;
  prCopy.push = function (...data) {
    const oValue = [...this];
    const r = pr.push.call(this, ...onCreate(this.getKey(), data));
    if (oValue.length !== this.length && created)
      trigger(this.getKey(), oValue, this);
    return r;
  };

  prCopy.concat = function (...data) {
    return pr.concat.call(this, ...onCreate(this.getKey(), data));
  };

  prCopy.shift = function () {
    const oValue = [...this];
    const r = pr.shift.call(this);
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  };

  prCopy.unshift = function (...data) {
    const oValue = [...this];
    const r = pr.unshift.call(this, ...onCreate(this.getKey(), data));
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  };

  prCopy.pop = function () {
    const oValue = [...this];
    const r = pr.pop.call(this);
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  };

  prCopy.slice = function (start, end) {
    const oValue = [...this];
    const r = pr.slice.call(this, start, end);
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  };

  prCopy.splice = function (start, deleteCount, ...data) {
    const oValue = [...this];
    const r = pr.splice.call(
      this,
      start,
      deleteCount,
      ...onCreate(this.getKey(), data)
    );
    if (oValue.length !== this.length) trigger(this.getKey(), oValue, this);
    return r;
  };
  if (dt) dt.forEach((x) => prCopy.push(x));
  created = true;
  return prCopy;
}
