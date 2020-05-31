// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
    player: {
      default: null,
      type: cc.Node,
    },
    /*should be more than one*/
    targetply: {
      default: null,
      type: cc.Node,
    },
    arrow: {
      default: null,
      type: cc.Node,
    },
  },

  // LIFE-CYCLE CALLBACKS:
  /* wrong
  onLoad() {
    const Ax = this.player.anchorX;
    const Ay = this.player.anchorY;
    this.arrow.setAnchorPoint(Ax, Ay);
    console.log(this.arrow.anchorX);
    console.log(this.arrow.anchorY);
  },
*/
  start() {
    this.turnToTar();
  },

  update() {
    this.turnToTar();
  },
  turnToTar() {
    let self = this;
    const dx = self.player.x - self.targetply.x;
    const dy = self.player.y - self.targetply.y;
    const dir = cc.v2(dx, dy);
    const angle = dir.signAngle(cc.v2(1, 0));
    const degree = (angle / Math.PI) * 180;
    self.arrow.rotation = degree;
  },
});
