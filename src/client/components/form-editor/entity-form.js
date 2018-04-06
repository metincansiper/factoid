const { Component } = require('react');
const _ = require('lodash');
const h = require('react-hyperscript');
const Popover = require('../popover/popover');
const ElementInfo = require('../element-info/element-info');

class EntityForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.data = _.assign( {
      style: 'form-entity',
      forceGrounding: false

    }, props );

  }

  updateEntityName(newName) {
    this.state.entity.name(newName);

    this.forceUpdate();
  }

  updateGrounding(){
    console.log(this.state.entity.name()!= null);
    console.log(this.state.entity.name().length);

    if(this.state.entity.name().length > 0)
      this.state.forceGrounding = true;

    this.setState(this.state);
  }
  render() {

    // return// h(Tooltip, {description: h(ElementInfo, { element: this.state.entity, document: this.state.document})},[//this.state.tooltipContent},[
      // h(ElementInfo, { element: this.state.entity, document: this.state.document}),

    let hFunc = h('div.form-interaction', [
      h('input[type="text"].' + this.state.style, {
        value: this.state.entity.name(),
        placeholder: this.state.placeholder,
        onChange: e => this.updateEntityName(e.target.value),
        onClick: e => this.updateGrounding()
      })
    ]);
    if(this.state.forceGrounding){
      hFunc = h(Popover, {
        tippy: {
          html: h(ElementInfo, { element: this.state.entity, document: this.state.document})}}, [hFunc]);

      this.state.forceGrounding = false;
    }

    return hFunc;
  }
}

module.exports = EntityForm;

