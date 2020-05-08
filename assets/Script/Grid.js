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
    gridColor: [],
  },

  onLoad() {
    this.initColor();
  },
  // 初始化记录方格颜色的数组
  initColor: function () {
    for (let i = 0; i < 70; i++) {
      this.gridColor[i] = [];
      for (let j = 0; j < 50; j++) {
        this.gridColor[i][j] = 0;
      }
    }
  },

  start() {},

  update(dt) {
    let gridX = this.convertToGridX(this.player.getPosition().x);
    let gridY = this.convertToGridY(this.player.getPosition().y);
    if (this.gridColor[gridX][gridY] == 0) {
      this.DyeGrid(gridX, gridY);
    }
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
    graphics.fillColor = cc.Color.RED;
    graphics.fillRect(
      gridX * this.gridPixel + 1,
      gridY * this.gridPixel + 1,
      this.gridPixel - 2,
      this.gridPixel - 2
    );
    this.gridColor[gridX][gridY] = 1;
  },
});
