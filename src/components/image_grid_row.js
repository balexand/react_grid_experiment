// jshint esnext:true

var GridImage = require('./grid_image');
var React = require('react');

var MARGIN = 0.01;

module.exports = class extends React.Component {
  computeWidths() {
    var images = [];
    React.Children.forEach(this.props.children, gridImage => images.push(gridImage.props.image));

    var rowWidth = 1 - (images.length - 1) * MARGIN;

    var sumOfAspectRatios = images.reduce((prev, image) => {
      return prev + image.width / image.height;
    }, 0);

    var rowHeight = rowWidth / sumOfAspectRatios;

    return images.map(image => {
      return rowWidth * (image.width / image.height) / sumOfAspectRatios;
    });
  }

  render() {
    var className = 'image-grid-row';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    var widths = this.computeWidths();

    return <div className={className}>
      {React.Children.map(this.props.children, (child, index) =>
        React.cloneElement(child, { width: widths[index] })
      )}
    </div>;
  }
};
