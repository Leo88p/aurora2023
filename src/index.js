import Phaser from 'phaser'

import StartingScene from '../scenes/starting-scene';


import {Pursuit} from '../src/ai/steerings/pursuit';
import {Evasion} from '../src/ai/steerings/evasion';
import {Flee} from '../src/ai/steerings/flee';

const config = {
  type: Phaser.AUTO, //webgl, webgpu
  width: 800,
  height: 600,
  pixelArt: true,
  zoom: 1.2,
  scene: StartingScene,
  physics: {
    default: "arcade",
    debug: true,
    arcade: {
      gravity: { y: 0,
        debug: true // set to true to view zones
        }
    }
  },
};

const game = new Phaser.Game(config);
game.scene.start('StartingScene', {steering: Pursuit})

const button = document.getElementById("button");
const select = document.getElementById("select");
button.addEventListener('click', (e)=>{
  let steering;
  switch (select.value) {
    case "pursuit": {
      steering = Pursuit
      break
    }
    case "evasion": {
      steering = Evasion
      break
    }
    case "flee": {
      steering = Flee
      break
    }
  }
  game.scene.start('StartingScene', {steering: steering})
});
