// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  properties: {
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
  },
  onLoad() {
    this.controlzone.on('touchstart', this.onTouchStart, this);
    this.controlzone.on('touchmove', this.onTouchMove, this);
    this.controlzone.on('touchend', this.onTouchEnd, this);
    this.controlzone.on('touchcancel', this.onTouchEnd, this);
  },
  start() {
    this.isMoving = false;
  },
  onDestroy() {
    this.controlzone.off('touchstart', this.onTouchStart, this);
    this.controlzone.off('touchmove', this.onTouchMove, this);
    this.controlzone.off('touchend', this.onTouchEnd, this);
    this.controlzone.off('touchcancel', this.onTouchEnd, this);
  },
  touchcontrolzone(event) {
    //console.log('OPENGL:', event.getLocationX(), event.getLocationY());

    let touchLocation = this.controlzone.convertToNodeSpaceAR(
      event.getLocation()
    );
    //FIXME
    //event.getLocation() error
    touchLocation = touchLocation.sub(cc.v2(160, -394));
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
    this.isMoving = true;
  },
  onTouchStart(event) {
    console.log(event.touch);
    this.touchcontrolzone(event);
  },
  onTouchMove(event) {
    this.touchcontrolzone(event);
  },
  onTouchEnd(event) {
    this.isMoving = false;
    this.controldot.setPosition(0, 0);
  },
  update(dt) {
    let direction = this.controldot.position.normalize();
    this.player.x = this.player.x + dt * this.playerspeed * direction.x;
    this.player.y = this.player.y + dt * this.playerspeed * direction.y;
  },
});
