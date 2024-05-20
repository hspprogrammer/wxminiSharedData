export interface ActiveEffect {
  (...args: any[]): any;
  deps: Array<ActiveEffect>;
  options: EffectOptions;
  page: any;
  _id: number;
}

export interface EffectOptions {
  scheduler?: Function;
  lazy?: Boolean;
}
