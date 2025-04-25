import { Injectable } from "@angular/core";
import { Howl, Howler } from "howler";

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sounds = new Map<string, Howl>();

  constructor() {
    Howler.volume(0.5);
  }

  stopAll() {
    Howler.stop();
  }

  setVolume(volume: number) {
    Howler.volume(volume);
  }

  async preload(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sound = new Howl({
        src: [url],
        onload: () => {
          this.sounds.set(key, sound);
          resolve();
        },
        onloaderror: (id, error) => {
          reject(error);
        }
      });
    });
  }

  async play(key: string, options?: { interrupt?: boolean, loop?: boolean }): Promise<void> {
    if (!this.sounds.has(key)) {
      await this.preload
    }
    return new Promise((resolve, reject) => {
      const sound = this.sounds.get(key);
      if (!sound) {
        return reject(`Sound ${key} not found`);
      }

      if (options) {
        if (options.interrupt) {
          sound.stop();
        }
        if (options.loop) {
          sound.loop(true);
        }
      }

      const soundId = sound.play();

      sound.once('end', () => resolve());
      sound.once('playerror', (id, error) => reject(error));
    });
  }

  async playSequence(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.play(key, { interrupt: false, loop: false });
    }
  }
}
