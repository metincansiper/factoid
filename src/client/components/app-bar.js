const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const { Component } = require('react');


// props:
// document
// controller
class AppBar extends Component {
  render(){
    const p = this.props;
    const id = p.document.id();
    const secret = p.document.secret();
    const bus = p.bus;

    return h('div.app-bar', [
      h('h2.app-bar-title', 'Factoid'),
      h('div.app-bar-buttons', [
        h(Link, { to: '/new/seed'}, [
          h('button.new-factoid', '+ New Factoid'),
        ]),
        h(Link, { to: `/document/${id}/${secret}` }, [
          h('button.context-siwtch', 'Graph Editor')
        ]),
        h(Link, { to: `/form/${id}/${secret}` }, [
          h('button.context-switch', 'Form Editor')
        ]),
        h(Link, { to: `/my-factoids` }, [
          h('button.my-factoids', 'My Factoids')
        ]),
        h('button.timeline-toggle', { onClick: e => bus.emit('toggletimeline') }, 'Toggle Guide')
      ])
    ]);
  }
}

module.exports = AppBar;