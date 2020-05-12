/**
 * A sand synthesizer
 * @param {WebGLRenderingContext} gl A WebGL rendering context
 * @constructor
 */
const Sand = function(gl) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.program = new Shader(
        gl,
        this.SHADER_VERTEX,
        this.SHADER_FRAGMENT,
        ["scale"],
        ["position"]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW);
};

Sand.prototype.SHADER_VERTEX = `#version 100
attribute vec2 position;

void main() {  
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

Sand.prototype.SHADER_FRAGMENT = `#version 100
` + CommonShaders.cubicNoise + `
uniform mediump float scale;

void main() {
  mediump float lightness = 0.4 + 0.2 * cubicNoise(vec3(2.0 * gl_FragCoord.xy / scale, 0.0));
  
  gl_FragColor = vec4(vec3(lightness), 1.0);
}
`;

/**
 * Write a sand texture
 * @param {Number} scale The render scale
 */
Sand.prototype.write = function(scale) {
    this.program.use();

    this.gl.uniform1f(this.program.uScale, scale);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.enableVertexAttribArray(this.program.aPosition);
    this.gl.vertexAttribPointer(this.program.aPosition, 2, this.gl.FLOAT, false, 8, 0);

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
};

/**
 * Free all resources maintained by this system
 */
Sand.prototype.free = function() {
    this.gl.deleteBuffer(this.buffer);
    this.program.free();
};