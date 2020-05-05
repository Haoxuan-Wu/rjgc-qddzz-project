// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  properties: {
    background: {
      default: null,
      type: cc.Node,
    },
    minimap: {
      default: null,
      type: cc.Node,
    },
    maincamera: {
      default: null,
      type: cc.Camera,
    },
    camera: {
      default: null,
      type: cc.Camera,
    },
    rect: {
      default: null,
      type: cc.Node,
    },
    player: {
      default: null,
      type: cc.Node,
    },
    cameraMaxX: 0,
    cameraMaxY: 0,
  },
  mapToMini(point) {
    const x =
      (point.x / this.background.width) *
      this.minimap.width *
      this.minimap.scaleX;
    const y =
      (point.y / this.background.height) *
      this.minimap.height *
      this.minimap.scaleY;
    return cc.v2(x, y);
  },
  miniToMap(point) {
    const x =
      ((point.x / this.minimap.width) * this.background.width) /
      this.minimap.scaleX;
    const y =
      ((point.y / this.minimap.height) * this.background.height) /
      this.minimap.scaleY;
    return cc.v2(x, y);
  },
  onLoad() {
    this.minimap.on('touchstart', this.onTouchStart, this);
    this.minimap.on('touchmove', this.onTouchMove, this);
    this.minimap.on('touchend', this.onTouchEnd, this);
    this.minimap.on('touchcancel', this.onTouchEnd, this);
  },
  start() {
    //小地图
    this.updateCameraPosition(cc.v2(this.player.x, this.player.y));
    let texture = new cc.RenderTexture();
    texture.initWithSize(this.minimap.width, this.minimap.height);
    let spriteFrame = new cc.SpriteFrame();
    let sprite = this.minimap.getComponent(cc.Sprite);
    spriteFrame.setTexture(texture);
    sprite.spriteFrame = spriteFrame;
    this.camera.targetTexture = texture;
    //this.minimap.node.tween(cc.follow(this.player));
  },
  onDestroy() {
    this.minimap.off('touchstart', this.onTouchStart, this);
    this.minimap.off('touchmove', this.onTouchMove, this);
    this.minimap.off('touchend', this.onTouchEnd, this);
    this.minimap.off('touchcancel', this.onTouchEnd, this);
  },
  touchMiniMap(event) {
    // console.log(event.getLocation().x);
    // console.log(event.getLocation().y);
    const touchLocation = this.minimap.convertToNodeSpaceAR(
      event.getLocation()
    );
    // console.log(touchLocation.x);
    // console.log(touchLocation.y);
    const position = this.miniToMap(touchLocation);
    // console.log(position.x);
    // console.log(position.y);
    this.updateCameraPosition(position);
  },
  onTouchStart(event) {
    this.touchMiniMap(event);
  },
  onTouchMove(event) {
    this.touchMiniMap(event);
  },
  onTouchEnd(event) {
    this.updateCameraPosition(cc.v2(this.player.x, this.player.y));
  },
  updateCameraPosition(target) {
    if (target.x > this.cameraMaxX) {
      target.x = this.cameraMaxX;
    }
    if (target.x < -this.cameraMaxX) {
      target.x = -this.cameraMaxX;
    }
    if (target.y > this.cameraMaxY) {
      target.y = this.cameraMaxY;
    }
    if (target.y < -this.cameraMaxY) {
      target.y = -this.cameraMaxY;
    }
    this.maincamera.node.position = target;
    this.updateMiniRect();
  },

  updateMiniRect() {
    // let pointCamera = this.maincamera.node.position.sub(
    //   cc.v2(cc.winSize.width / 2, cc.winSize.height / 2)
    // );
    let pointCamera = this.maincamera.node.position;
    pointCamera = this.mapToMini(pointCamera);
    this.rect.position = pointCamera;
    let canvas = this.rect.getComponent(cc.Graphics);
    let rect_size = this.rect.getContentSize();
    canvas.clear();
    canvas.rect(
      pointCamera.x,
      pointCamera.y,
      rect_size.width,
      rect_size.height
    );
    canvas.stroke();
  },
});
