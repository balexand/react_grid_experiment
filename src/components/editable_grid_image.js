// jshint esnext:true

var Capabilities = require('../utils/capabilities');
var GridImage = require('./grid_image');
var Immutable = require('immutable');
var interact = require('interact.js');
var React = require('react');

module.exports = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragging: null };
  }

  componentDidMount() {
    var elem = React.findDOMNode(this.refs.gridImage.refs.img);

    this.interactable = interact(elem);

    this.interactable.on('contextmenu', function (event) {
      event.preventDefault();
    }).draggable({
      manualStart: Capabilities.isTouch(),

      onstart: (event) => {
        this.setState({ dragging: { dx: 0, dy: 0 } });

        if (this.props.onDragStart) {
          this.props.onDragStart(this.props.image, event);
        }
      },

      onmove: (event) => {
        this.setState({ dragging: {
          dx: this.state.dragging.dx + event.dx,
          dy: this.state.dragging.dy + event.dy
        } });

        if (this.props.onDragMove) {
          this.props.onDragMove(event);
        }
      },

      onend: (event) => {
        this.setState({ dragging: null });

        if (this.props.onDragEnd) {
          this.props.onDragEnd(event);
        }
      }
    }).on('hold', (event) => {
      var interaction = event.interaction;

      if (!interaction.interacting()) {
        interaction.start({ name: 'drag' }, event.interactable, event.currentTarget);
      }
    });
  }

  componentWillUnmount() {
    this.interactable.unset();
    this.interactable = null;
  }

  handleDelete(event) {
    event.preventDefault();

    this.props.onDeleted(this.props.image);
  }

  render() {
    var imgClassName = '';
    var imgStyle = Immutable.Map(this.props.imgStyle);

    if (this.state.dragging) {
      imgClassName = 'dragging';

      imgStyle = imgStyle.set('transform', `translate(${this.state.dragging.dx}px, ${this.state.dragging.dy}px)`);
    }

    if (this.props.anyImgDragging && !this.state.dragging) {
      imgStyle = imgStyle.set('transition', 'transform 0.5s');
    }

    return <GridImage image={this.props.image} width={this.props.width} imgClassName={imgClassName} imgStyle={imgStyle.toJS()} ref="gridImage">
      <button className="close" onClick={this.handleDelete.bind(this)}>X</button>
    </GridImage>;
  }
};
