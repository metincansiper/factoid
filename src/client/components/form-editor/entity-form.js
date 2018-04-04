const { Component } = require('react');
const _ = require('lodash');
const Tooltip = require('../popover/tooltip');
const h = require('react-hyperscript');

class EntityForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.data = _.assign( {
      style: 'form-entity'

    }, props );

  }

  updateEntityName(newName) {
    this.state.entity.name(newName);
    this.forceUpdate();
  }

  render() {

    return h(Tooltip, {description: this.state.tooltipContent}, [
      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.state.entity.name(),
          placeholder: this.state.placeholder,
          onChange: e => this.updateEntityName(e.target.value)
        })
      ])]);
  }
}

module.exports = EntityForm;

