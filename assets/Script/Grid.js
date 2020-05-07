cc.Class({
  extends: cc.Component,

  properties: {
    graphNode: {
      default: null,
      type: cc.Node,
    },
    player: {
      default: null,
      type: cc.Node,
    },
    gridPixel: {
      default: 30,
    },
  },

  onLoad() {},

  start() {
    cc.log(this.convertToGridX(this.player.getPosition().x));
    cc.log();
  },

  update(dt) {
    let gridX =
      this.convertToGridX(this.player.getPosition().x) * this.gridPixel;
    let gridY =
      this.convertToGridY(this.player.getPosition().y) * this.gridPixel;
    this.DyeGrid(gridX, gridY);
  },

  // 将小羊坐标转换为网格坐标，以左下角为坐标原点
  convertToGridX: function (x) {
    return parseInt((x + 1050) / this.gridPixel);
  },
  convertToGridY: function (y) {
    return parseInt((y + 750) / this.gridPixel);
  },
  // 将网格染色
  DyeGrid: function (gridX, gridY) {
    let graphics = this.graphNode.getComponent(cc.Graphics);
    graphics.rect(gridX + 1, gridY + 1, this.gridPixel - 2, this.gridPixel - 2);
    graphics.fillColor = cc.Color.RED;
    graphics.fill();
  },
});
