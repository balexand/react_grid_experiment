var _isTouch = 'ontouchstart' in document.documentElement;

module.exports = {
  isTouch: function() {
    return _isTouch;
  }
};
