// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  properties: {
    UI: {
      default: null,
      type: cc.Node,
    },
    background: {
      default: null,
      type: cc.Node,
    },
    minimap: {
      default: null,
      type: cc.Node,
    },
    playercamera: {
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
    minimapTouched: 0,
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
    this.updateUIPosition(cc.v2(this.player.x, this.player.y));
    this.initRect();
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
    this.minimapTouched = 1;
    let ca_touchLocation = this.playercamera.getScreenToWorldPoint(
      event.getLocation()
    );
    let touchLocation = this.minimap.convertToNodeSpaceAR(ca_touchLocation);
    console.log(
      ca_touchLocation.x,
      ca_touchLocation.y,
      touchLocation.x,
      touchLocation.y
    );
    let position = this.miniToMap(touchLocation);
    this.updateUIPosition(position);
    this.updateRectPosition(touchLocation);
  },
  onTouchStart(event) {
    this.touchMiniMap(event);
  },
  onTouchMove(event) {
    this.touchMiniMap(event);
  },
  onTouchEnd(event) {
    this.updateUIPosition(cc.v2(this.player.x, this.player.y));
    this.updateRectPosition(
      this.mapToMini(cc.v2(this.player.x, this.player.y))
    );
    this.minimapTouched = 0;
  },
  updateUIPosition(target) {
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
    // 更新UI
    //target.x = target.x - this.camera.node.x - this.camera.node.parent.x;
    //target.y = target.y - this.camera.node.y - this.camera.node.parent.y;
    this.UI.setPosition(target);
  },
  updateRectPosition(target) {
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
    //FIXME
    //this.rect.position = target.sub(cc.v2(52, -98));
    this.rect.setPosition(target);
  },

  initRect() {
    // let pointCamera = this.playercamera.node.position.sub(
    //   cc.v2(cc.winSize.width / 2, cc.winSize.height / 2)
    // );
    let pointCamera = this.playercamera.node.position;
    pointCamera = this.mapToMini(pointCamera);
    this.updateRectPosition(this.mapToMini(this.player.position));
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
