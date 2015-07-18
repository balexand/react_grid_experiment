// jshint esnext:true

var capitalize = require('./capitalize');
var Immutable = require('immutable');

var properties = Immutable.List.of(
  'transform',
  'transition'
);

module.exports = function(style) {
  if (!style) { return style; }

  style = Immutable.Map(style);

  properties.forEach((property) => {
    var s = style.get(property);
    if (s) {
      style = style.set(`Webkit${capitalize(property)}`, s.replace('transform', '-webkit-transform'));
    }
  });

  return style.toJS();
};
