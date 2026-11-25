/** Paso de llenado de la ventana de contexto: 0 a 20, uno por cada 5 %. */
export type Level = number

declare module 'claude-code' {
  interface PluginState {
    'frac-sand-west-texas': { level: Level }
  }
}
