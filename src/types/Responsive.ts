export interface ActiveEffect {
  (...args: any[]): any;
  deps: Array<ActiveEffect>
  options: EffectOptions
}

export interface EffectOptions {
  scheduler?: Function
}
