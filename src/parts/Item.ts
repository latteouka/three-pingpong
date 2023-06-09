import * as THREE from "three";
import vertex from "../glsl/item.vert";
import fragment from "../glsl/item.frag";
import fragmentBuffer from "../glsl/itemBuffer.frag";
import { MyObject3D } from "../webgl/myObject3D";
import { Update } from "../libs/update";
import { Func } from "../core/func";

export class Item extends MyObject3D {
  private _mesh: THREE.Mesh;
  private _meshOffscreen: THREE.Mesh;
  private dataTexture: THREE.DataTexture;

  private _material: THREE.ShaderMaterial;
  private _bufferMaterial: THREE.ShaderMaterial;

  private _sceneOffscreen = new THREE.Scene();

  private _renderTargetA = new THREE.WebGLRenderTarget(
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

  private _renderTargetB = new THREE.WebGLRenderTarget(
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
    // texture will be filled by offscreen render result texture
    this._material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        u_time: { value: Update.instance.elapsed },
        u_texture: { value: null },
      },
    });

    this._bufferMaterial = new THREE.ShaderMaterial({
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

    this._mesh = new THREE.Mesh(geometry, this._material);
    this._mesh.scale.set(Func.instance.sw(), Func.instance.sh(), 1);
    this.add(this._mesh);

    // offscreen
    this._meshOffscreen = new THREE.Mesh(geometry, this._bufferMaterial);
    this._meshOffscreen.scale.set(Func.instance.sw(), Func.instance.sh(), 1);
    this._sceneOffscreen.add(this._meshOffscreen);
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

  public render(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera
  ): void {
    // offscreen render
    renderer.setRenderTarget(this._renderTargetA);
    renderer.render(this._sceneOffscreen, camera);

    // real quad mesh's texture
    this._material.uniforms.u_texture.value = this._renderTargetA.texture;
    renderer.setRenderTarget(null);

    // ping-pong
    // the previous frame's *output* becomes the next frame's *input*
    const temp = this._renderTargetA;
    this._renderTargetA = this._renderTargetB;
    this._renderTargetB = temp;
    this._bufferMaterial.uniforms.u_texture.value = this._renderTargetB.texture;
  }

  protected _update(): void {
    super._update();
  }

  protected _resize(): void {
    super._resize();
    this._mesh.scale.set(Func.instance.sw(), Func.instance.sh(), 1);

    this._bufferMaterial.uniforms.u_resolution.value.set(
      Func.instance.sw(),
      Func.instance.sh()
    );
  }
}
