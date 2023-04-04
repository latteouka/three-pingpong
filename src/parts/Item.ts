import * as THREE from "three";
import vertex from "../glsl/item.vert";
import fragment from "../glsl/item.frag";
import fragmentBuffer from "../glsl/itemBuffer.frag";
import { MyObject3D } from "../webgl/myObject3D";
import { Update } from "../libs/update";
import { Func } from "../core/func";

export class Item extends MyObject3D {
  public mesh: THREE.Mesh;
  public offscreenMesh: THREE.Mesh;
  private dataTexture: THREE.DataTexture;

  public material: THREE.ShaderMaterial;
  public materialBuffer: THREE.ShaderMaterial;

  public offscreenScene = new THREE.Scene();

  public renderTargetA = new THREE.WebGLRenderTarget(
    Func.instance.sw(),
    Func.instance.sh(),
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
    }
  );

  public renderTargetB = new THREE.WebGLRenderTarget(
    Func.instance.sw(),
    Func.instance.sh(),
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
    }
  );
  constructor() {
    super();

    this.dataTexture = this.createDataTexture();

    const geometry = new THREE.PlaneGeometry(1, 1);

    // just a container for offscreen render result
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        u_time: { value: Update.instance.elapsed },
        u_texture: { value: null },
      },
    });

    this.materialBuffer = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragmentBuffer,
      uniforms: {
        u_time: { value: Update.instance.elapsed },
        u_texture: { value: this.dataTexture },
        u_resolution: {
          value: new THREE.Vector2(Func.instance.sw(), Func.instance.sh()),
        },
      },
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.scale.set(Func.instance.sw(), Func.instance.sh(), 1);
    this.add(this.mesh);

    // offscreen
    this.offscreenMesh = new THREE.Mesh(geometry, this.materialBuffer);
    this.offscreenMesh.scale.set(Func.instance.sw(), Func.instance.sh(), 1);
    this.offscreenScene.add(this.offscreenMesh);
  }

  protected createDataTexture() {
    // create a buffer with color data

    var size = Func.instance.sw() * Func.instance.sh();
    var data = new Uint8Array(4 * size);

    for (var i = 0; i < size; i++) {
      var stride = i * 4;

      if (Math.random() < 0.7) {
        data[stride] = 255;
        data[stride + 1] = 255;
        data[stride + 2] = 255;
        data[stride + 3] = 255;
      } else {
        data[stride] = 0;
        data[stride + 1] = 0;
        data[stride + 2] = 0;
        data[stride + 3] = 255;
      }
    }

    var texture = new THREE.DataTexture(
      data,
      Func.instance.sw(),
      Func.instance.sh(),
      THREE.RGBAFormat
    );

    texture.needsUpdate = true;

    return texture;
  }

  protected _update(): void {
    super._update();
  }

  protected _resize(): void {
    super._resize();
    this.mesh.scale.set(Func.instance.sw(), Func.instance.sh(), 1);

    this.materialBuffer.uniforms.u_resolution.value.set(
      Func.instance.sw(),
      Func.instance.sh()
    );
  }
}
