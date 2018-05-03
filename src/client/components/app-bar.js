const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const { Component } = require('react');

const Tooltip = require('./popover/tooltip');


// props:
// document
// controller
class AppBar extends Component {
  constructor(props){
    super(props);

    this.state = {
      docName: props.document.name()
    };
  }

  updateDocName(newVal){
    this.props.document.name(newVal);
    this.setState({
      docName: newVal
    });
  }

  render(){
    const p = this.props;
    const id = p.document.id();
    const secret = p.document.secret();
    const bus = p.bus;

    const buttons = [
      h(Link, { to: '/new/seed'}, [
        h('button.new-factoid', [
          h('i.material-icons', 'add_circle'),
          ' New Factoid'
        ])
      ]),
      h(Link, { to: `/my-factoids` }, [
        h('button.my-factoids', [
          h('i.material-icons', 'person'),
          ' My Factoids'
        ])
      ]),
      h('button.timeline-toggle', { onClick: e => bus.emit('toggletimeline') }, 'Toggle Guide')
    ];

    if (!this.props.inGraphEditor) {
      buttons.push(
        h(Link, { to: `/document/${id}/${secret}` }, [
          h('button.context-siwtch', 'Graph Editor')
        ])
      );
    } else {
      buttons.push(
        h(Link, { to: `/form/${id}/${secret}` }, [
          h('button.context-switch', 'Form Editor')
        ])
      );
    }

    return h('div.app-bar', [
      h('div.app-bar-title-container', [
        h('h2.app-bar-title', 'Factoid'),
        h('input.doc-name', {
          type: 'text',
          placeholder: 'Untitled document',
          value:  this.state.docName || p.document.name(),
          onChange: e => this.updateDocName(e.target.value)
        })
      ]),
      h('div.app-bar-buttons', buttons)
    ]);
  }
}

module.exports = AppBar;