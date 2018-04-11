const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class PhysicalInteractionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;

    let hFunc = intn.elements().map(el =>{
      return h('div', [h(EntityForm, {entity:el, placeholder:'Molecule', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
    });

    return h('div.form-interaction', [
      ...hFunc,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: e => {this.addEntityRow();}},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),
    ]);
  }

}
module.exports = PhysicalInteractionForm;