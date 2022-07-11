import { VSHADER_SOURCE, FSHADER_SOURCE } from "./shaders.js"
import "./gl-matrix-min.js"

const spherePointCloud = (pointCount) => {
  let points = []
  for (let i = 0; i < pointCount; i++) {
    const r = () => Math.random() - 0.5
    const inputPoint = [r(), r(), r()]

    const outputPoint = vec3.normalize(vec3.create(), inputPoint)

    points.push(...outputPoint)
  }
  return points
}

const vertexData = spherePointCloud(5e5)

const createShader = (gl, type, str) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, str)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const createBuffer = (gl, array, program, attribute) => {
  const attribLocation = gl.getAttribLocation(program, attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(attribLocation)
  gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0)
}

const initShaders = (gl, program) => {
  const VS = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE)
  const FS = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE)

  gl.attachShader(program, VS)
  gl.attachShader(program, FS)

  gl.linkProgram(program)

  createBuffer(gl, vertexData, program, `position`)
  // createBuffer(gl, colorData, "color", program)

  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST)
}

const webGLStart = () => {
  const canvas = document.getElementById("canvasGL")
  if (!canvas) {
    console.log("failed")
    return
  }

  const gl = canvas.getContext("webgl", { antialias: true })
  if (!gl) console.log("Yor don't have WebGL!")

  const shaderProgram = gl.createProgram()

  initShaders(gl, shaderProgram)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  const uniformLocations = {
    matrix: gl.getUniformLocation(shaderProgram, `matrix`),
  }

  const modelMatrix = mat4.create()
  const viewMatrix = mat4.create()
  const projectionMatrix = mat4.create()

  mat4.perspective(
    projectionMatrix,
    (75 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.001,
    1000
  )

  const mvMatrix = mat4.create()
  const mvpMatrix = mat4.create()

  mat4.translate(modelMatrix, modelMatrix, [0, 0, 0])
  mat4.translate(viewMatrix, viewMatrix, [0, 0, 1.7])
  mat4.invert(viewMatrix, viewMatrix)

  // mat4.scale(modelMatrix, modelMatrix, [0.9, 0.9, 0.9])

  const animation = () => {
    requestAnimationFrame(animation)
    // mat4.rotateZ(modelMatrix, modelMatrix, 0.005)
    mat4.rotateY(modelMatrix, modelMatrix, 0.004)
    // mat4.rotateX(modelMatrix, modelMatrix, 0.007)

    mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)

    gl.clearColor(0.07, 0.09, 0.13, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.POINTERS, 0, vertexData.length / 3)
  }

  animation()
}

webGLStart()
