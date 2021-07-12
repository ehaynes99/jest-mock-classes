import { createMockInstance } from './createMockInstance';

describe('createMockInstance', () => {
  it('allows mocking properties', async () => {
    const instance = createMockInstance(TestClass, {
      stuff: 'some stuff',
    });

    expect(instance.stuff).toEqual('some stuff');
  });

  it('allows mocking class properties', async () => {
    const instance = createMockInstance(TestClass, {
      moreStuff: 'some stuff',
    });

    expect(instance.moreStuff).toEqual('some stuff');
  });

  it('allows mocking methods', async () => {
    const instance = createMockInstance(TestClass, {
      doSomething: (arg?: string) => {
        return `mock called with: ${arg}`;
      },
    });

    const result = instance.doSomething('hello');
    expect(result).toEqual('mock called with: hello');
  });

  it('allows mocking async methods', async () => {
    const instance = createMockInstance(TestClass, {
      doSomethingElse: async (arg: string) => {
        return `mock called with: ${arg}`;
      },
    });

    const result = instance.doSomethingElse('hello');
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual('mock called with: hello');
  });

  it('allows mocking superclass methods', async () => {
    const instance = createMockInstance(TestClass, {
      superSomething: () => {
        return 'super stuff';
      },
    });

    const result = instance.superSomething();
    expect(result).toEqual('super stuff');
  });

  it('exposes the method jest.fn behavior', async () => {
    const instance = createMockInstance(TestClass, {
      doSomething: () => 'something',
    });

    expect(instance.doSomething.mockImplementation).toBeInstanceOf(Function);
    expect((instance.doSomething as any)._isMockFunction).toBe(true);
  });

  it('allows "this" to refer to the result', async () => {
    const instance = createMockInstance(TestClass, {
      doSomething() {
        return this.stuff;
      },
    });
    instance.stuff = 'some stuff';

    const result = instance.doSomething();
    expect(result).toEqual('some stuff');
  });

  it('creates a default mock', async () => {
    const instance = createMockInstance(TestClass);

    expect(instance.stuff).toBeUndefined();
    expect((instance.doSomething as any)['_isMockFunction']).toBe(true);
  });

  it('requires type to be a class', async () => {
    const thing = {};
    expect(() => {
      // @ts-expect-error must supply a class
      createMockInstance(thing);
    }).toThrow(new TypeError('MockClass is not a constructor'));
  });

  // Can only really test the Typescript compiler for this.
  // Instance variables are not actually "defined" as part of
  // the class metadata, so throwing an error for this would
  // preclude mocking instance variables
  it('requires implementations to match the class', async () => {
    // @ts-expect-error mocks must match class definition
    createMockInstance(TestClass, { what: 'ever' });
  });

  it('passes instanceOf checks', async () => {
    const instance = createMockInstance(TestClass);
    expect(instance).toBeInstanceOf(TestClass);
  });
});

class SuperClass {
  superSomething() {
    return 'default super';
  }
}

class TestClass extends SuperClass {
  constructor(public stuff: string) {
    super();
  }

  public moreStuff = 'hello';

  doSomething(arg?: string): string {
    return arg || 'default';
  }

  async doSomethingElse(arg: string) {
    return arg;
  }
}
