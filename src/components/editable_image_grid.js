// jshint esnext:true

var $ = require('jquery');
var DropTargetCalculator = require('../utils/drop_target_calculator');
var EditableGridImage = require('./editable_grid_image');
var ImageGridRow = require('./image_grid_row');
var Immutable = require('immutable');
var React = require('react');

var DraggingRecord = Immutable.Record({
  dropTargetCalculator: null,
  colIndex: null,
  rowIndex: null,
  x: null,
  y: null,
});

module.exports = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragging: null };
  }

  getDropAction() {
    if (this.state.dragging) {
      return this.state.dragging.dropTargetCalculator.getDropAction(
        this.state.dragging.x,
        this.state.dragging.y
      );
    } else {
      return null;
    }
  }

  getImgStyle(dropAction, rowIndex, colIndex) {
    var style = {};

    if (dropAction && dropAction.type === 'row') {
      if (dropAction.rowIndex <= rowIndex) {
        style.transform = 'translateY(20px)';
      } else {
        style.transform = 'translateY(-20px)';
      }
    }

    if (dropAction && dropAction.type === 'col' && dropAction.rowIndex === rowIndex) {
      if (dropAction.colIndex <= colIndex) {
        style.transform = 'translateX(20px)';
      } else {
        style.transform = 'translateX(-20px)';
      }
    }

    return style;
  }

  render() {
    var dropAction = this.getDropAction();

    var imageProps = {
      onDragEnd: this._handleDragEnd.bind(this),
      onDragMove: this._handleDragMove.bind(this),
      onDragStart: this._handleDragStart.bind(this),
      onDeleted: this.props.onImageDeleted
    };

    if (this.state.dragging) {
      imageProps.anyImgDragging = true;
    }

    return <div className="image-grid draggable">
      {this.props.post.rows.map((images, rowIndex) =>
        <ImageGridRow key={rowIndex}>
          {images.map((image, colIndex) =>
            <EditableGridImage
              key={image.uid}
              image={image}
              imgStyle={this.getImgStyle(dropAction, rowIndex, colIndex)}
              ref={`row${rowIndex}col${colIndex}`}
              {...imageProps}
            />
          )}
        </ImageGridRow>
      )}
    </div>;
  }

  _handleDragEnd(event) {
    // FIXME return unless state.dragging (with tests)
    // FIXME tests

    var dropAction = this.state.dragging.dropTargetCalculator.getDropAction(
      event.pageX,
      event.pageY
    );

    if (dropAction) {
      this.props.onImageDropped(this.state.dragging.rowIndex, this.state.dragging.colIndex, dropAction);
    }

    this.setState({ dragging: null });
  }

  _handleDragMove(event) {
    // FIXME return unless state.dragging (with tests)

    this.setState({ dragging: this.state.dragging.merge({
      x: event.pageX,
      y: event.pageY
    }) });
  }

  _handleDragStart(image, event) {
    // TODO we should be passing rows as a prop, not post. The only reason
    // that I'm passing post is to call indexesOf. This should be moved
    // to a util instead.
    var { rowIndex, colIndex } = this.props.post.indexesOf(image);

    // FIXME tests on index calculations
    this.setState({ dragging: new DraggingRecord({
      dropTargetCalculator: new DropTargetCalculator(this._imageOffsets(), rowIndex, colIndex),
      colIndex: colIndex,
      rowIndex: rowIndex,
      x: event.pageX,
      y: event.pageY
    }) });
  }

  _imageOffsets() {
    return this.props.post.rows.map((images, rowIndex) =>
      images.map((image, colIndex) => {
        var $elem = $(React.findDOMNode(this.refs[`row${rowIndex}col${colIndex}`]));
        var offset = $elem.offset();

        return {
          height: $elem.outerHeight(),
          left: offset.left,
          top: offset.top,
          width: $elem.outerWidth()
        };
      })
    ).toJS();
  }
};
