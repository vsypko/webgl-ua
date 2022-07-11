import "./node_modules/gl-matrix/gl-matrix-min.js"

export const VSHADER_SOURCE = `
precision mediump float;
attribute vec3 position;
varying vec3 vColor;

uniform mat4 matrix;

void main() {
  vColor = vec3(0.5, 0.5, position.z + 0.45);
  gl_Position = matrix * vec4(position, 1);
}
`

export const FSHADER_SOURCE = `
precision mediump float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1);
}
`
