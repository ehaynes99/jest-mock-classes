import { ModuleMocker } from 'jest-mock';

type Class<T> = { new (...args: any[]): T };

type PartialMock<T> = {
  [P in keyof T]?: T[P] extends (...args: any) => infer R
    ? (this: T, ...args: Parameters<T[P]>) => R
    : T[P];
};

export const createMockInstance = <T>(
  classToMock: Class<T>,
  values?: PartialMock<T>,
): jest.Mocked<T> => {
  const mocker = new ModuleMocker(global);
  const metadata = mocker.getMetadata(classToMock);

  // unclear why/if this would ever be null, but either way, it's not a constructor
  // https://github.com/facebook/jest/blob/6308b6c8e43b0f2a4301c224b6c2177dd3270fc9/packages/jest-mock/src/index.ts#L302
  if (!metadata) {
    throw new TypeError('classToMock must be a class or constructor');
  }
  const MockClass = mocker.generateFromMetadata(metadata);
  const instance = new MockClass() as any;
  if (values) {
    type Prop = keyof T;
    const props = Object.keys(values) as Prop[];
    props.forEach((prop) => {
      const instanceValue = instance[prop];
      if (typeof instanceValue === 'function') {
        instanceValue.mockImplementation(values[prop]);
      } else {
        instance[prop] = values[prop];
      }
    });
  }
  return Object.assign(Object.create(classToMock.prototype), instance);
};
