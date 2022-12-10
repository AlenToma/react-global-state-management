function cleanStringify(object) {
    if (object && typeof object === 'object') {
      object = copyWithoutCircularReferences([object], object);
    }
    return JSON.stringify(object);
  
    function copyWithoutCircularReferences(references, object) {
      const isArray = object && Array.isArray(object) && typeof object !== "string";
      var cleanObject = isArray ? [] : {};
      const push = (key, item) => {
        if (item === null || item === undefined)
            return;
        if (isArray) cleanObject.push(item);
        else cleanObject[key] = item;
      };
  
      Object.keys(object).forEach(function (key) {
        var value = object[key];
        if (value && typeof value === 'object') {
          if (references.indexOf(value) < 0) {
            references.push(value);
            push(key, copyWithoutCircularReferences(references, value));
            references.pop();
          } else {
            push(key, '###_Circular_###');
          }
        } else {
          push(key, value);
        }
      });
      return cleanObject;
    }
  }
  export default cleanStringify;
  