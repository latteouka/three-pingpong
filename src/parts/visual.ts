import { Func } from "../core/func";
import { Canvas } from "../webgl/canvas";
import { Object3D } from "three/src/core/Object3D";
import { Update } from "../libs/update";
import { Item } from "./Item";

export class Visual extends Canvas {
  private _con: Object3D;
  private _item: Item;

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    this._item = new Item();

    this._con.add(this._item);

    this._resize();
  }

  protected _update(): void {
    super._update();

    if (this.isNowRenderFrame()) {
      this._render();
    }
  }

  private _render(): void {
    this.renderer.setClearColor("#000", 1);

    // offscreen render
    this.renderer.setRenderTarget(this._item.renderTargetA);
    this.renderer.render(this._item.offscreenScene, this.cameraPers);

    // real quad mesh's texture
    this._item.material.uniforms.u_texture.value =
      this._item.renderTargetA.texture;

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.mainScene, this.cameraPers);

    // ping-pong
    // the previous frame's *output* becomes the next frame's *input*
    const temp = this._item.renderTargetA;
    this._item.renderTargetA = this._item.renderTargetB;
    this._item.renderTargetB = temp;
    this._item.materialBuffer.uniforms.u_texture.value =
      this._item.renderTargetB.texture;
  }

  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0;
  }

  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 90;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
