// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
let minimap = require(minimap);
cc.Class({
  extends: cc.Component,

  properties: {
    playercamera: {
      default: null,
      type: cc.Camera,
    },
    UI: {
      default: null,
      type: cc.Node,
    },
    minimap: {
      default: null,
      type: cc.Node,
    },
    controlzone: {
      default: null,
      type: cc.Node,
    },
    controldot: {
      default: null,
      type: cc.Node,
    },
    player: {
      default: null,
      type: cc.Node,
    },
    playerspeed: 0,
    speed1: 1,
    speed2: 2,
  },
  onLoad() {
    /*
    this.controlzone.on('touchstart', this.onTouchStart, this);
    this.controlzone.on('touchmove', this.onTouchMove, this);
    this.controlzone.on('touchend', this.onTouchEnd, this);
    this.controlzone.on('touchcancel', this.onTouchEnd, this);
    */
  },
  start() {
    this._minimap = this.minimap.getComponent('minimap');
    this.controlzone.on('touchstart', this.onTouchStart, this);
    this.controlzone.on('touchmove', this.onTouchMove, this);
    this.controlzone.on('touchend', this.onTouchEnd, this);
    this.controlzone.on('touchcancel', this.onTouchEnd, this);
    // console.log(
    //   this.controlzone.convertToWorldSpaceAR(this.controlzone.position)
    // );
  },
  onDestroy() {
    this.controlzone.off('touchstart', this.onTouchStart, this);
    this.controlzone.off('touchmove', this.onTouchMove, this);
    this.controlzone.off('touchend', this.onTouchEnd, this);
    this.controlzone.off('touchcancel', this.onTouchEnd, this);
  },
  touchcontrolzone(event) {
    //console.log('OPENGL:', event.getLocationX(), event.getLocationY());
    let ca_touchLocation = this.playercamera.getScreenToWorldPoint(
      event.getLocation()
    );
    let touchLocation = this.controlzone.convertToNodeSpaceAR(ca_touchLocation);
    //FIXME
    //event.getLocation() error
    // touchLocation = touchLocation.sub(cc.v2(160, -394));
    console.log(touchLocation.x, touchLocation.y);
    let radius = this.controlzone.width / 2;
    let distance = touchLocation.mag();
    if (radius > distance) {
      this.controldot.setPosition(touchLocation);
    } else {
      //控杆永远保持在圈内，并在圈内跟随触摸更新角度
      touchLocation.x = (touchLocation.x * radius) / distance;
      touchLocation.y = (touchLocation.y * radius) / distance;
      this.controldot.setPosition(touchLocation);
    }
    this.playerspeed = this.speed1;
    //this.updateplayer();
  },
  onTouchStart(event) {
    // console.log('Start:', event);
    let self = this;
    let ca_touchLocation = self.playercamera.getScreenToWorldPoint(
      event.getLocation()
    );
    let touchLocation = this.controlzone.convertToNodeSpaceAR(ca_touchLocation);
    console.log(touchLocation.x, touchLocation.y);
    let radius = self.controlzone.width / 2;
    let distance = touchLocation.mag();
    if (radius > distance) {
      self.controldot.setPosition(touchLocation);
      self.playerspeed = self.speed1;
      return true;
    } else {
      return false;
    }
  },
  onTouchMove(event) {
    // console.log('Move:', event);
    this.touchcontrolzone(event);
  },
  onTouchEnd(event) {
    this.controldot.setPosition(0, 0);
    this.playerspeed = 0;
  },
  /*
  updateplayer() {
    let direction = this.controldot.position.normalize();
    this.player.x = this.player.x + this.playerspeed * direction.x;
    this.player.y = this.player.y + this.playerspeed * direction.y;
    this.UI.x = this.UI.x + this.playerspeed * direction.x;
    this.UI.y = this.UI.y + this.playerspeed * direction.y;
    let delta = this._minimap.mapToMini(direction.mul(this.playerspeed / 10));
    this._minimap.rect.x = this._minimap.rect.x + delta.x;
    this._minimap.rect.y = this._minimap.rect.y + delta.y;
  },
  */
  update: function () {
    let direction = this.controldot.position.normalize();
    this.player.x = this.player.x + this.playerspeed * direction.x;
    this.player.y = this.player.y + this.playerspeed * direction.y;
    this.UI.x = this.UI.x + this.playerspeed * direction.x;
    this.UI.y = this.UI.y + this.playerspeed * direction.y;
    let delta = this._minimap.mapToMini(direction.mul(this.playerspeed / 10));
    this._minimap.rect.x = this._minimap.rect.x + delta.x;
    this._minimap.rect.y = this._minimap.rect.y + delta.y;
    //console.log(this._minimap.rect.x, this._minimap.rect.y);
  },
});
