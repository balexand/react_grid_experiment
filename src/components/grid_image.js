// jshint esnext:true

var prefix = require('../utils/prefix');
var React = require('react');

module.exports = class extends React.Component {
  render() {
    var wrapperStyle = {
      paddingBottom: `${100 * this.props.width * this.props.image.height / this.props.image.width}%`,
      width: `${this.props.width * 100}%`
    };

    return <div className="img-wrapper" style={wrapperStyle}>
      <img
        className={this.props.imgClassName}
        src={this.props.image.url}
        ref="img"
        style={prefix(this.props.imgStyle)}
      />
    {this.props.children}
    </div>;
  }
};
