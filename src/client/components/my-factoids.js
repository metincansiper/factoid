const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const { Component } = require('react');


class MyFactoids extends Component {
  constructor(props){
    super(props);

    this.state = {
      factoidsLoaded: false,
      factoids: []
    };

    fetch('/api/document/my-factoids').then(res => res.json()).then(factoids => this.setState({
      factoids: factoids,
      factoidsLoaded: true
    }));
  }
  render(){
    let factoids = this.state.factoids.map(factoid => {
      return h('div', [
        h(Link, { className: 'plain-link', to: `/document/${factoid.id}/${factoid.secret}`}, 'untitled factoid')
      ]);
    });

    let content = this.state.factoidsLoaded ? h('div.factoid-list', [
      h('h2', 'My Factoids'),
      ...factoids
    ]) : h('div', 'loading');

    return h('div.my-factoids', [
      content
    ]);
  }
}

module.exports = MyFactoids;