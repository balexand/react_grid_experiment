// jshint esnext:true

var GridImage = require('./grid_image');
var ImageGridRow = require('./image_grid_row');
var React = require('react');

module.exports = class extends React.Component {
  render() {
    return <div className="image-grid">
      {this.props.rows.map((images, index) =>
        <ImageGridRow key={index}>
          {images.map(image =>
            <GridImage key={image.uid} image={image} />
          )}
        </ImageGridRow>
      )}
    </div>;
  }
};

// FIXME add tests
