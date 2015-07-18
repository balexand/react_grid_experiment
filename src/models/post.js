// jshint esnext:true

var assign = require('object-assign');
var Immutable = require('immutable');
var PostImage = require('./post_image');

module.exports = class extends Immutable.Record({ id: undefined, body: undefined, occurredOn: undefined, rows: undefined }) {
  constructor(obj) {
    obj = assign({}, obj);

    if (!obj.rows) {
      obj.rows = Immutable.List();
    }

    obj.occurredOn = obj.occurred_on;

    obj.rows = Immutable.List(obj.rows.map(row =>
      Immutable.List(row.map(image =>
        image ? new PostImage(image) : null
      ))
    ));

    super(obj);
  }

  compactRows() {
    return this.update('rows', rows =>
      rows.map(row =>
        row.filter(i => i)
      ).filter(row =>
        row.size > 0
      )
    );
  }

  indexesOf(image) {
    var rowIndex = this.rows.findIndex(images => images.includes(image));
    if (rowIndex < 0) { return {}; }

    var colIndex = this.rows.get(rowIndex).indexOf(image);

    return { rowIndex: rowIndex, colIndex: colIndex };
  }
};
