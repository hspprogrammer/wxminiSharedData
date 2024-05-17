export interface ActiveEffect {
  (...args: any[]): any;
  deps: Set<ActiveEffect>
  options: EffectOptions
}

export interface EffectOptions {
  scheduler?: Function
}

