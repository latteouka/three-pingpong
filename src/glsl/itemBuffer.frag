uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_resolution;

varying vec3 v_pos;
varying vec2 v_uv;

float GetNeighbours(vec2 p) {
    float count = 0.0;

    for(float y = -1.0; y <= 1.0; y++) {
        for(float x = -1.0; x <= 1.0; x++) {

            if(x == 0.0 && y == 0.0)
                continue;

            // Scale the offset down
            vec2 offset = vec2(x, y) / u_resolution;
            // Apply offset and sample texture
            vec4 lookup = texture2D(u_texture, p + offset);
             // Accumulate the result
            count += lookup.r > 0.5 ? 1.0 : 0.0;
        }
    }

    return count;
}

void main(void) {
  vec3 color = vec3(0.0);

  float neighbors = 0.0;

  neighbors += GetNeighbours(v_uv);

  bool alive = texture2D(u_texture, v_uv).x > 0.5;

  //cell is alive
  if(alive && (neighbors == 2.0 || neighbors == 3.0)) {

    //Any live cell with two or three live neighbours lives on to the next generation.
    color = vec3(1.0, 0.0, 0.0);

    //cell is dead
    } else if (!alive && (neighbors == 3.0)) {
    //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
      color = vec3(1.0, 0.0, 0.0);

    }

  //In all other cases cell remains dead or dies so color stays at 0
  gl_FragColor = vec4(color, 1.0);
}
