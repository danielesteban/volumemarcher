[volumemarcher](https://github.com/danielesteban/volumemarcher)
[![npm-version](https://img.shields.io/npm/v/volumemarcher.svg)](https://www.npmjs.com/package/volumemarcher)
==

## Example

[glitch.com/~volumemarcher](https://glitch.com/~volumemarcher)

## Installation

```bash
npm i volumemarcher
```

## Basic usage

```js
import {
  Data3DTexture,
  LinearFilter,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import VolumeMarcher from 'volumemarcher';

const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.01, 100);
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const size = 128;
const volume = new Data3DTexture(new Uint8Array((size * 4) ** 3), size, size, size);
volume.minFilter = LinearFilter;
volume.magFilter = LinearFilter;
volume.unpackAlignment = 1;
volume.needsUpdate = true;
for (let i = 0, l = volume.image.data.length; i < l; i++) {
  volume.image.data[i] = Math.random() * 255;
}

const scene = new Scene();
const volumemarcher = new VolumeMarcher({ volume });
volumemarcher.position.set(0, 0, -2);
scene.add(volumemarcher);

renderer.setAnimationLoop(() => (
  renderer.render(scene, camera)
));
```

## Want to contribute?

Here's how to setup the module dev environment:

```bash
# clone this repo
git clone https://github.com/danielesteban/volumemarcher.git
cd volumemarcher
# install dependencies
npm install
# start the environment:
npm start
# open http://localhost:8080/example in your browser
```
