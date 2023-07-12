import { Object } from '../object';

export const newEnclosedEnvironment = (outer: Environment): Environment => {
  const env = createNewEnvironment();

  env.outer = outer;

  return env;
};

export const createNewEnvironment = (): Environment => {
  const s = new Map();
  return new Environment(s, null);
};

type EnvironmentType = {
  store: Map<string, Object>;
  outer: Environment | null;
};

export class Environment implements EnvironmentType {
  public store;
  public outer;

  constructor(store: Map<string, Object>, outer: Environment | null) {
    this.store = store;
    this.outer = outer;
  }

  public get(name: string): Object | null {
    let obj: Object | null | undefined = this.store.get(name);

    if (!obj && this.outer !== null) {
      obj = this.outer.get(name);
    }

    return obj ?? null;
  }

  public set(name: string, obj: Object | null) {
    if (obj) return this.store.set(name, obj);
  }
}
