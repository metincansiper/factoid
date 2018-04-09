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
      showEntityInfo: false

    }, props );

  }

  updateEntityName(newName) {
    this.state.entity.name(newName);
    this.setState(this.state);

  }

  updateGrounding(stateVal){

    if(this.state.entity.name().length > 0)
      this.state.showEntityInfo = stateVal;
    this.setState(this.state);

  }

  // boundclick(){
  //   $('#tippy-'+ this.state.entity.id()).bind('click', function(){
  //     console.log("clicked");
  //   });
// }

  render() {


    let hFunc;
    let hCompletedStatus;

    if(this.state.entity.completed())
      hCompletedStatus = h('i.material-icons.entity-info-complete-icon', 'check_circle');
    else
      hCompletedStatus = h('i.material-icons', 'help');

    hFunc = h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.state.entity.name(),
          placeholder: this.state.placeholder,
          onChange: e => this.updateEntityName(e.target.value),
          onClick: e => this.updateGrounding(true)
        }),
        hCompletedStatus
      ]);

    if(this.state.showEntityInfo){


      hFunc = h(Popover, {
        tippy: {
          // trigger: 'mouseenter focus',
          // trigger: 'click',
          html: h(ElementInfo, { element: this.state.entity, document: this.state.document})}}, [hFunc]);

    }

    return hFunc;
  }
}

module.exports = EntityForm;

