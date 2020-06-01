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
    // 网格像素大小
    gridPixel: {
      default: 30,
    },
    // 地图大小
    mapWidth: {
      default: 2100,
    },
    mapHeight: {
      default: 1500,
    },
    // 数组坐标上界
    maxGridX: {
      default: 70,
    },
    maxGridY: {
      default: 50,
    },
    //存储上一次的xGrid编号，以判断是否移动
    lastXGrid: {
      default: -1,
    },
    lastYGrid: {
      default: -1,
    },
    // 二维数组，存储网格颜色
    gridColor: [],
    // 二维数组，染色前判断是否为保留区
    reservedZone: [],
    // {x:,y:}的结构数组，用于存储路径信息
    walkPath: [],
    // 结构数组，存储第y行第一个与最后一个被染色网格的x坐标
    searchYX: [],
    BLANKCOLOR: 0,
    // 标记已走过路线但还未成为领地的网格
    ROUTECOLOR: 1,
    // 领地网格
    TERRITORYCOLOR: 2,
  },

  onLoad() {},

  start() {
    this.maxGridX = this.mapWidth / this.gridPixel;
    this.maxGridY = this.mapHeight / this.gridPixel;
    this.initColor();
  },
  // 初始化记录方格颜色的数组与保留区数组
  initColor: function () {
    for (let i = 0; i < this.maxGridX; i++) {
      this.gridColor[i] = [];
      this.reservedZone[i] = [];
      for (let j = 0; j < this.maxGridY; j++) {
        this.gridColor[i][j] = this.BLANKCOLOR;
        this.reservedZone[i][j] = false;
      }
    }
    // 将出生点周围的3x3格子作为保留区
    let gridX = this.convertToGridX(this.player.getPosition().x);
    let gridY = this.convertToGridY(this.player.getPosition().y);
    for (let i = gridX - 1; i < gridX + 2; i++) {
      for (let j = gridY - 1; j < gridY + 2; j++) {
        this.dyeGrid(i, j, this.TERRITORYCOLOR);
        this.reservedZone[i][j] = true;
      }
    }

    for (let j = 0; j < this.maxGridY; j++) {
      let temp = new Object();
      temp.first = this.maxGridX;
      temp.last = 0;
      this.searchYX[j] = temp;
    }
    for (let j = gridY - 1; j < gridY + 2; j++) {
      this.searchYX[j].first = gridX - 1;
      this.searchYX[j].last = gridX + 1;
    }
    cc.log(this.searchYX);
  },
  update(dt) {
    let gridX = this.convertToGridX(this.player.getPosition().x);
    let gridY = this.convertToGridY(this.player.getPosition().y);
    this.dyeInsideArea(gridX, gridY);
    this.drawRoute(this.player.getPosition().x, this.player.getPosition().y);
  },

  // 将小羊坐标转换为网格坐标，以左下角为坐标原点
  convertToGridX: function (x) {
    return parseInt((x + this.mapWidth / 2) / this.gridPixel);
  },
  convertToGridY: function (y) {
    return parseInt((y + this.mapHeight / 2) / this.gridPixel);
  },
  // 画出小羊轨迹
  drawRoute: function (x, y) {
    let ctx = this.graphNode.getComponent(cc.Graphics);
    ctx.fillColor = cc.Color.WHITE;
    ctx.circle(x + this.mapWidth / 2, y + this.mapHeight / 2, 3);
    ctx.fill();
  },
  // 将网格染色
  dyeGrid: function (gridX, gridY, color) {
    // 当前染色的格子不属于保留区
    if (!this.reservedZone[gridX][gridY]) {
      let ctx = this.graphNode.getComponent(cc.Graphics);
      ctx.fillColor = cc.Color.RED;
      // +1是为了留出边界的距离
      ctx.fillRect(
        gridX * this.gridPixel + 1,
        gridY * this.gridPixel + 1,
        this.gridPixel - 2,
        this.gridPixel - 2
      );
      this.gridColor[gridX][gridY] = color;
    }
  },

  dyeInsideArea: function (gridX, gridY) {
    if (gridX === this.lastXGrid && gridY === this.lastYGrid) {
      // 位置没有变化
      return;
    }
    this.lastXGrid = gridX;
    this.lastYGrid = gridY;
    if (
      this.walkPath.length != 0 &&
      (this.walkPath[this.walkPath.length - 1].x !== gridX ||
        this.walkPath[this.walkPath.length - 1].y !== gridY)
    ) {
      //如果新的格子不在原有的路径上

      if (this.gridColor[gridX][gridY] == this.ROUTECOLOR) {
        this.selfAreaFill(gridX, gridY);
      } else if (this.gridColor[gridX][gridY] == this.TERRITORYCOLOR) {
        this.terriAreaFill();
      }
      //当队友闭合的时候，调用团队闭合算法
      // this.patternRouterCircle(this.cellIndex);
      //当画线到自身阵营
    }

    if (
      this.gridColor[gridX][gridY] !== this.ROUTECOLOR &&
      this.gridColor[gridX][gridY] != this.TERRITORYCOLOR
    ) {
      this.dyeGrid(gridX, gridY, this.ROUTECOLOR); //对位置进行染色
      let point = new Object();
      point.x = gridX;
      point.y = gridY;
      this.walkPath.push(point);
    }
    /*if ( >= 0) {
      cc.log("设置颜色this.cellIndex---" + this.cellIndex + "--color--" + route[this.cellIndex][2]);
      route[this.cellIndex][2] = common.myColor;
      this.pushNowRoute(this.cellIndex); //放入路径
      cc.log("路徑顔色填充" + route[this.cellIndex]);
    } else {
      cc.log("is wrong")
    }*/
  },

  isClosePath: function (gridX, gridY) {
    return (
      this.gridColor[gridX][gridY] == this.ROUTECOLOR ||
      this.gridColor[gridX][gridY] == this.TERRITORYCOLOR
    );
  },

  selfAreaFill: function (gridX, gridY) {
    let index = this.getPathIndex(gridX, gridY);
    if (index !== -1) {
      //获取闭合下标,从routeIndex所在位置进行截取this.nowRoute.indexOf(routeIndex)
      let toBeClosed = this.walkPath.slice(index);
      //进行填充
      if (toBeClosed.length > 4) {
        this.fillCircle(toBeClosed);
      }
    }
  },
  terriAreaFill: function () {
    let toBeClosed = this.walkPath.slice();
    if (toBeClosed.length > 2) {
      this.fillCircle(toBeClosed);
    }
  },
  getPathIndex: function (gridX, gridY) {
    let currentPoint = new Object();
    currentPoint.x = gridX;
    currentPoint.y = gridY;
    return (this.walkPath || []).findIndex(
      (pathPoint) =>
        pathPoint.x === currentPoint.x && pathPoint.y === currentPoint.y
    );
  },

  fillCircle: function (toBeClosed) {
    function sortByField(a, b) {
      return a.x - b.x;
    }
    let yMax = 0; //获取坐标中最大的Y ?多少
    let yMin = this.maxGridY; //获取坐标中最小的Y
    let arrayX = new Array();
    for (let i = 0; i < toBeClosed.length; i++) {
      let y = toBeClosed[i].y;
      if (y > yMax) {
        yMax = y;
      }
      if (y < yMin) {
        yMin = y;
      }
      this.gridColor[toBeClosed[i].x][toBeClosed[i].y] = this.TERRITORYCOLOR;
    }
    //对每行格子进行扫描,扫描范围是 yMin-yMax
    let xBig = 0;
    let xSmall = 0;
    let sameY = new Array(); //这个数组以所有的Y为索引，存储每一个Y扫描的交点在路径数组中的下标和x值
    for (let i = 0; i < toBeClosed.length; i++) {
      scanPoint = new Object();
      scanPoint.x = toBeClosed[i].x;
      scanPoint.index = i;
      if (sameY[[toBeClosed[i].y]] == undefined) {
        sameY[[toBeClosed[i].y]] = [];
      }
      sameY[toBeClosed[i].y].push(scanPoint);
    }
    for (let i = yMin + 1; i < yMax; i++) {
      //对每行格子进行扫描，获取y = i 的格子坐标
      sameY[i].sort(sortByField);
      arrayX = this.filterExtraPoint(sameY[i], toBeClosed);
      arrayX.sort(sortByField);
      cc.log(i + '行扫描的交点数' + arrayX.length);
      cc.log(arrayX);
      cc.log(this.searchYX);

      if (sameY[i][0].x < this.searchYX[i].first) {
        this.searchYX[i].first = sameY[i][0].x;
      }
      if (sameY[i][sameY[i].length - 1].x > this.searchYX[i].last) {
        this.searchYX[i].last = sameY[i][sameY[i].length - 1].x;
      }

      //每两个之间进行填充
      for (let j = 0; j < arrayX.length / 2; j++) {
        if (arrayX[j * 2 + 1].x > arrayX[j * 2].x) {
          xBig = arrayX[j * 2 + 1].x;
          xSmall = arrayX[j * 2].x;
        } else {
          xSmall = arrayX[j * 2 + 1].x;
          xBig = arrayX[j * 2].x;
        }
        for (let m = xSmall + 1; m < xBig; m++) {
          this.dyeGrid(m, i, this.TERRITORYCOLOR);
        }
      }
    }
    //this.clearNowRoute();
    for (let i = 0; i < this.walkPath.length; i++) {
      this.gridColor[this.walkPath[i].x][
        this.walkPath[i].y
      ] = this.TERRITORYCOLOR;
    }
    this.walkPath.splice(0, this.walkPath.length);
  },

  filterExtraPoint: function (arrayX, toBeClosed) {
    // 在一行扫描线相交的像素点中
    for (let i = 0; i < arrayX.length - 1; i++) {
      //删除连在一起的x
      if (
        Math.abs(arrayX[i].x - arrayX[i + 1].x) === 1 &&
        (Math.abs(arrayX[i].index - arrayX[i + 1].index) === 1 ||
          Math.abs(arrayX[i].index - arrayX[i + 1].index) ===
            toBeClosed.length - 1)
      ) {
        arrayX.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < arrayX.length; i++) {
      let index = arrayX[i].index;

      let backPoint = (index + 1) % toBeClosed.length;
      let frontPoint =
        (((index - 1) % toBeClosed.length) + toBeClosed.length) %
        toBeClosed.length; //取模而不是取余
      while (toBeClosed[backPoint].y === toBeClosed[index].y) {
        //寻找最近的不同y的点
        backPoint = (backPoint + 1) % toBeClosed.length;
      }
      while (toBeClosed[frontPoint].y === toBeClosed[index].y) {
        frontPoint =
          (((frontPoint - 1) % toBeClosed.length) + toBeClosed.length) %
          toBeClosed.length;
      }

      if (
        toBeClosed[backPoint].y < toBeClosed[index].y &&
        toBeClosed[frontPoint].y < toBeClosed[index].y
      ) {
        arrayX.splice(i, 1);
      } else if (
        toBeClosed[backPoint].y > toBeClosed[index].y &&
        toBeClosed[frontPoint].y > toBeClosed[index].y
      ) {
        arrayX.splice(i, 1);
      }
    }
    if (arrayX.length === 1) {
      let indexY = toBeClosed[arrayX[0].index].y;
      let addPoint = new Object();
      addPoint.index = undefined;
      if (arrayX[0].x < this.searchYX[indexY].first) {
        addPoint.x = this.searchYX[indexY].first;
      } else if (arrayX[0].x > this.searchYX[indexY].last) {
        addPoint.x = this.searchYX[indexY].last;
      }
      arrayX.push(addPoint);
    }
    return arrayX;
  },
});
