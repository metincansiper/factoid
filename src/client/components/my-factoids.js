const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const { Component } = require('react');


class MyFactoids extends Component {
  render(){
    return h('div', 'My factoids')
  }
}

module.exports = MyFactoids;