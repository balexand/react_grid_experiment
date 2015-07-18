// jshint esnext:true

var Immutable = require('immutable');
require('./polyfills');

var BOUNDARY_LEEWAY = 100;
var RATIO = 0.1;

var ColAction = Immutable.Record({ type: 'col', rowIndex: null, colIndex: null });
var RowAction = Immutable.Record({ type: 'row', rowIndex: null });

class DropTargetCalculator {
  constructor(imageOffsets, draggingRow, draggingCol) {
    this.dropTargets = DropTargetCalculator.calculateRowDropTargets(imageOffsets).concat(
      DropTargetCalculator.calculateColDropTargets(imageOffsets)
    );
  }

  // Returns one of:
  //   * null - not over a drop target
  //   * { type: 'row', rowIndex: <integer> } - insert a new row at rowIndex
  //   * { type: 'col', rowIndex: <integer>, colIndex: <integer> } - insert new column in existing row
  getDropAction(x, y) {
    var target = this.dropTargets.find(target =>
      x >= target.left && x <= target.left + target.width &&
      y >= target.top && y <= target.top + target.height
    );

    return target ? target.action : null;
  }
}

// The following methods should be considered private, but are publicly accessible for testability.
DropTargetCalculator.calculateColDropTargets = function(imageOffsets) {
  var dropTargets = [];

  imageOffsets.forEach((row, rowIndex) => {
    var top = row[0].top + RATIO * row[0].height;
    var height = row[0].height * (1 - 2*RATIO);

    for (var i = 0; i <= row.length; i++) {
      var previousOffset = row[i - 1];
      var nextOffset = row[i];

      var left, right;

      if (previousOffset) {
        left = previousOffset.left + (1 - 2*RATIO) * previousOffset.width;
      } else {
        left = nextOffset.left - BOUNDARY_LEEWAY;
      }

      if (nextOffset) {
        right = nextOffset.left + RATIO * nextOffset.width;
      } else {
        right = previousOffset.left + previousOffset.width + BOUNDARY_LEEWAY;
      }

      dropTargets.push({
        action: new ColAction({ rowIndex: rowIndex, colIndex: i }),
        height: height,
        left: left,
        top: top,
        width: right - left
      });
    }
  });

  return dropTargets;
};

DropTargetCalculator.calculateRowDropTargets = function(imageOffsets) {
  if (imageOffsets.length === 0) { return []; }

  var dropTargets = [];

  var left = imageOffsets[0][0].left;
  var topRight = imageOffsets[0][imageOffsets[0].length - 1];
  var width = topRight.left + topRight.width - left;

  for (var i = 0; i <= imageOffsets.length; i++) {
    var previousRow = imageOffsets[i - 1];
    var nextRow = imageOffsets[i];

    var top, bottom;

    if (previousRow) {
      top = previousRow[0].top + (1 - RATIO) * previousRow[0].height;
    } else {
      top = nextRow[0].top - BOUNDARY_LEEWAY;
    }

    if (nextRow) {
      bottom = nextRow[0].top + RATIO * nextRow[0].height;
    } else {
      bottom = previousRow[0].top + previousRow[0].height + BOUNDARY_LEEWAY;
    }

    dropTargets.push({
      action: new RowAction({ rowIndex: i }),
      height: bottom - top,
      left: left,
      top: top,
      width: width
    });
  }

  return dropTargets;
};

module.exports = DropTargetCalculator;
