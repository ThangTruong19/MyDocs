export function Mixin(baseCtors: any[]) {
  return function (derivedCtor: Function) {
    baseCtors.forEach(baseCtor => {
      const fieldCollector = new baseCtor();
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        Object.getOwnPropertyNames(fieldCollector).forEach((n) => {
          derivedCtor.prototype[n] = fieldCollector[n];
        });
        const descriptor = Object.getOwnPropertyDescriptor(
          baseCtor.prototype,
          name
        );

        if (name === 'constructor') {
          return;
        }

        if (
          descriptor &&
          (!descriptor.writable ||
            !descriptor.configurable ||
            !descriptor.enumerable ||
            descriptor.get ||
            descriptor.set)
        ) {
          Object.defineProperty(derivedCtor.prototype, name, descriptor);
        } else {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        }
      });
    });
  };
}
