import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    parent,
    width: Math.min(window.innerWidth, 960),
    height: Math.min(window.innerHeight, 640),
    backgroundColor: '#0d1117',
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    input: {
      touch: true,
      mouse: true,
    },
    audio: {
      disableWebAudio: false,
    },
  };

  return new Phaser.Game(config);
}
