export const defineMethod = (item: any, k: string, g: Function) => {
    try {
      Object.defineProperty(item, k, { 
        value: g.bind(item),
        enumerable: false,
        configurable: true,
      });
    } catch (e) {
      console.error(e);
    }
  };
  
  export const defineProp = (item: any, k: string, v: any) => {
    try {
      Object.defineProperty(item, k, { 
        value: v,
        enumerable: false,
        configurable: false,
        writable: false,
      });
    } catch (e) {
      console.error(e);
    }
  };
  
    
  