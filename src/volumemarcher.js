import {
  BackSide,
  BoxGeometry,
  GLSL3,
  Mesh,
  RawShaderMaterial,
} from 'three';
import lighting from './lighting.glsl';
import fragment from './shader.frag';
import vertex from './shader.vert';

class VolumeMarcher extends Mesh {
  constructor({
    displacementFrequency = 0,
    displacementScale = 0,
    envMap = null,
    envMapIntensity = 1,
    metalness = 0,
    roughness = 0,
    threshold = 0.5,
    volume,
  } = {}) {
    const geometry = new BoxGeometry(1, 1, 1, 100, 100, 100);
    geometry.deleteAttribute('normal');
    geometry.deleteAttribute('uv');
    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: vertex,
      fragmentShader: fragment.replace('#include <lighting>', lighting),
      defines: {
        STEPS: '512.0',
      },
      uniforms: {
        displacementFrequency: { value: displacementFrequency },
        displacementScale: { value: displacementScale },
        envMap: { value: null },
        envMapIntensity: { value: envMapIntensity },
        metalness: { value: metalness },
        roughness: { value: roughness },
        threshold: { value: threshold },
        volume: { value: volume },
      },
      side: BackSide,
    });
    super(geometry, material);
    const { defines, uniforms } = material;
    this.userData = {
      get displacementFrequency() {
        return uniforms.displacementFrequency.value;
      },
      set displacementFrequency(value) {
        uniforms.displacementFrequency.value = value;
      },
      get displacementScale() {
        return uniforms.displacementScale.value;
      },
      set displacementScale(value) {
        uniforms.displacementScale.value = value;
      },
      get envMap() {
        return uniforms.envMap.value;
      },
      set envMap(value) {
        uniforms.envMap.value = value;
        if (defines.ENVMAP_TYPE_CUBE_UV !== !!value) {
          defines.ENVMAP_TYPE_CUBE_UV = !!value;
          material.needsUpdate = true;
        }
        if (value) {
          const maxMip = Math.log2(value.image.height / 32 + 1) + 3;
          const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
          const texelHeight = 1.0 / value.image.height;
          if (defines.CUBEUV_MAX_MIP !== `${maxMip}.0`) {
            defines.CUBEUV_MAX_MIP = `${maxMip}.0`;
            material.needsUpdate = true;
          }
          if (defines.CUBEUV_TEXEL_WIDTH !== texelWidth) {
            defines.CUBEUV_TEXEL_WIDTH = texelWidth;
            material.needsUpdate = true;
          }
          if (defines.CUBEUV_TEXEL_HEIGHT !== texelHeight) {
            defines.CUBEUV_TEXEL_HEIGHT = texelHeight;
            material.needsUpdate = true;
          }
        }
      },
      get envMapIntensity() {
        return uniforms.envMapIntensity.value;
      },
      set envMapIntensity(value) {
        uniforms.envMapIntensity.value = value;
      },
      get metalness() {
        return uniforms.metalness.value;
      },
      set metalness(value) {
        uniforms.metalness.value = value;
      },
      get roughness() {
        return uniforms.roughness.value;
      },
      set roughness(value) {
        uniforms.roughness.value = value;
      },
      get threshold() {
        return uniforms.threshold.value;
      },
      set threshold(value) {
        uniforms.threshold.value = value;
      },
      volume,
    };
    if (envMap) {
      this.userData.envMap = envMap;
    }
  }

  copy(source) {
    const { userData } = this;
    const { userData: { displacementFrequency, displacementScale, envMap, envMapIntensity, metalness, roughness, threshold, volume } } = source;
    userData.displacementFrequency = displacementFrequency;
    userData.displacementScale = displacementScale;
    userData.envMap = envMap;
    userData.envMapIntensity = envMapIntensity;
    userData.metalness = metalness;
    userData.roughness = roughness;
    userData.threshold = threshold;
    userData.volume = volume;
    return this;
  }

  dispose() {
    const { geometry, material } = this;
    geometry.dispose();
    material.dispose();
  }
}

export default VolumeMarcher;
