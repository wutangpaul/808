export type Instrument = "kick" | "snare" | "openhat" | "clap" | "cowbell" | "rimshot";

export interface InstrumentSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  muted: boolean;
}