# jest-mock-classes


Provides a simple, declarative syntax for creating mock instances of classes. Jest provides some pretty great functionality for mocking, classes, but it doesn't directly expose this without mocking the import. Often, you don't want to change the behavior of the import, but rather just need a mocked instance to pass as part of your test.

## Usage
If you have a class such as:
```typescript
class ExampleClass {
  constructor(public stuff: string) {}

  public moreStuff = 'hello';

  doSomething(arg?: string): string {
    return arg || 'default';
  }

  async doSomethingElse(arg: string) {
    return arg;
  }
}
```

`createMockInstance` accepts a class, then an object containing all of the mocked behavior desired for the mocked result.

```typescript
import { createMockInstance } from 'jest-mock-classes';

it('allows mocking', async () => {
  const instance = createMockInstance(ExampleClass, {
    stuff: 'some stuff',
    doSomething: (arg?: string) => {
      return `mocked result: ${arg}`;
    },
    doSomethingElse: async (arg: string) => {
      return `async mocked result: ${arg}`;
    },
  });

  expect(instance.stuff).toEqual('some stuff');

  expect(instance.doSomething('test')).toEqual('mocked result: test');
  expect(await instance.doSomethingElse('test')).toEqual(
    'async mocked result: test',
  );
});
```

The methods of the mocked instance (whether an implementation was provided or not) are `jest.fn` and can be interacted with like any other mock function. 

```typescript
it('uses jest mocks', async () => {
  const instance = createMockInstance(ExampleClass);

  instance.doSomething.mockImplementation(() => 'hello!');

  expect(instance.doSomething()).toEqual('hello!');
});
```

The partial implementation is type safe, so the mocks must match the actual signatures of the real class.
```typescript
createMockInstance(ExampleClass, {
  // Argument of type '{ unknownMethod: () => string; }' is not assignable to parameter of type 'PartialMock<ExampleClass>'.
  // Object literal may only specify known properties, and 'unknownMethod' does not exist in type 'PartialMock<ExampleClass>'.ts(2345)
  unknownMethod: () => 'whatever',
})

createMockInstance(ExampleClass, {
  // Type '(arg: number) => number' is not assignable to type '(this: ExampleClass, arg?: string | undefined) => string'.
  //   Types of parameters 'arg' and 'arg' are incompatible.
  //     Type 'string | undefined' is not assignable to type 'number'.
  //       Type 'undefined' is not assignable to type 'number'.ts(2322)
  doSomething: (arg: number) => 123,
})

createMockInstance(ExampleClass, {
  // Type 'number' is not assignable to type 'string | undefined'.ts(2322)
  stuff: 123,
})
```

---
#### Disclaimer
I'm not affiliated with Facebook or the jest project in any way.