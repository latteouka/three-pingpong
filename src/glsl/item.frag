uniform float u_time;
uniform sampler2D u_texture;

varying vec3 v_pos;
varying vec2 v_uv;

void main(void) {
  float time = u_time * 0.0001;

  vec4 color = texture2D(u_texture, v_uv);

  gl_FragColor = color;
}
