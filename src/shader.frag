precision highp float;
precision highp sampler3D;

in vec3 vOrigin;
in vec3 vDirection;

uniform vec3 cameraPosition;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;
uniform sampler2D envMap;
uniform float displacementFrequency;
uniform float displacementScale;
uniform float envMapIntensity;
uniform float metalness;
uniform float roughness;
uniform float threshold;
uniform sampler3D volume;

out vec4 fragColor;

#define saturate(a) clamp(a, 0.0, 1.0)
#define texture2D texture
#include <cube_uv_reflection_fragment>
#include <encodings_pars_fragment>
#include <lighting>

vec3 getColor(const in vec3 p) {
  return texture(volume, p).rgb;
}

float getDistance(const in vec3 p) {
  float distance = texture(volume, p).a;
  vec3 d = (p - 0.5) * displacementFrequency;
  return distance + (
    sin(d.x)*sin(d.y)*sin(d.z) * displacementScale
  );
}

vec3 getNormal(vec3 coord) {
  const float step = 0.005;
  return normalize(vec3(
    getDistance(coord + vec3(-step, 0.0, 0.0)) - getDistance(coord + vec3(step, 0.0, 0.0)),
    getDistance(coord + vec3(0.0, -step, 0.0)) - getDistance(coord + vec3(0.0, step, 0.0)),
    getDistance(coord + vec3(0.0, 0.0, -step)) - getDistance(coord + vec3(0.0, 0.0, step))
  ));
}

vec2 getHitBox(const in vec3 orig, const in vec3 dir) {
  const vec3 box_min = vec3(-0.5);
  const vec3 box_max = vec3(0.5);
  vec3 inv_dir = 1.0 / dir;
  vec3 tmin_tmp = (box_min - orig) * inv_dir;
  vec3 tmax_tmp = (box_max - orig) * inv_dir;
  vec3 tmin = min(tmin_tmp, tmax_tmp);
  vec3 tmax = max(tmin_tmp, tmax_tmp);
  float t0 = max(tmin.x, max(tmin.y, tmin.z));
  float t1 = min(tmax.x, min(tmax.y, tmax.z));
  return vec2(t0, t1);
}

void main() {
  vec3 rayDir = normalize(vDirection);
  vec2 bounds = getHitBox(vOrigin, rayDir);
  if (bounds.x > bounds.y) discard;
  bounds.x = max(bounds.x, 0.0);
  vec3 p = vOrigin + bounds.x * rayDir;
  vec3 inc = 1.0 / abs(rayDir);
  float delta = min(inc.x, min(inc.y, inc.z));
  delta /= STEPS;

  vec4 color = vec4(0.0);
  for (float t = bounds.x; t < bounds.y; t += delta) {
    float distance = getDistance(p + 0.5);
    if (distance >= threshold) {
      color.rgb = getLight(
        mat3(modelMatrix) * p,
        normalize(mat3(transpose(inverse(modelMatrix))) * getNormal(p + 0.5)),
        getColor(p + 0.5)
      );
      color.a = 1.0;
      break;
    }
    p += rayDir * delta;
  }
  if (color.a == 0.0) discard;

  fragColor = saturate(LinearTosRGB(color));
}
