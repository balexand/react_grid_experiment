// jshint esnext:true

var BottomRouteMixin = require('./mixins/BottomRouteMixin');
var EditableImageGrid = require('./editable_image_grid');
var Immutable = require('immutable');
var { Link, RouteHandler } = require('react-router');
var moment = require('moment');
var Post = require('../models/post');
var postStore = require('../stores/post_store');
var React = require('react');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [BottomRouteMixin],

  getInitialState() {
    var post;
    if (this.isNew()) {
      post = new Post()
        .set('occurredOn', moment().format('YYYY-MM-DD'))
        .set('body', '');
    } else {
      post = postStore.get(this.props.postId);
    }

    return { post: post };
  },

  addImage(image) {
    // FIXME tests and cleanup
    var post = this.state.post;

    var lastRowIndex = post.rows.size - 1;

    if (lastRowIndex >= 0 && post.rows.get(lastRowIndex).size < 3) {
      console.log('inserting in last low');
      post = post.updateIn(['rows', lastRowIndex], images =>
        images.push(image)
      );
    } else {
      console.log('creating new row');
      post = post.update('rows', rows =>
        rows.push(Immutable.List.of(image))
      );
    }

    this.setState({ post: post.compactRows() });
  },

  handleImageDeleted(image) {
    // FIXME tests

    var post = this.state.post;
    var { rowIndex, colIndex } = post.indexesOf(image);

    if (rowIndex === null || colIndex === null) { return; }

    this.setState({ post: post.deleteIn(['rows', rowIndex, colIndex]).compactRows() });
  },

  handleImageDropped(rowIndex, colIndex, dropAction) {
    var post = this.state.post;
    var image = post.getIn(['rows', rowIndex, colIndex]);

    post = post.setIn(['rows', rowIndex, colIndex], null);

    if (dropAction.type === 'row') {
      post = post.update('rows', rows =>
        rows.splice(dropAction.rowIndex, 0, Immutable.List.of(image))
      );
    } else if (dropAction.type === 'col') {
      post = post.updateIn(['rows', dropAction.rowIndex], images =>
        images.splice(dropAction.colIndex, 0, image)
      );
    }

    this.setState({ post: post.compactRows() });
  },

  handlePickerImageClicked(image) {
    console.log('handlePickerImageClicked');
    console.log(image.toString());
  },

  isNew() {
    return this.props.postId === 'new';
  },

  render() {
    if (['editPost', 'newPost'].includes(this.getBottomRoute().name)) {
      return (
        <div className="form-container">
          {this.getBottomRoute().name}

          <EditableImageGrid
            onImageDeleted={this.handleImageDeleted}
            onImageDropped={this.handleImageDropped}
            post={this.state.post} />

          <br />

          <Link to={`${this.isNew() ? 'new' : 'edit'}ImagePicker`} params={{ postId: this.state.post.id }}>Add Images</Link>

          <br />

          <textarea placeholder="Type some content" value={this.state.post.body} />
          <input type="date" value={this.state.post.occurredOn} />
        </div>
      );
    } else {
      return <RouteHandler selectedImages="FIXME" onImageClicked={this.handlePickerImageClicked} />;
    }
  }
});
