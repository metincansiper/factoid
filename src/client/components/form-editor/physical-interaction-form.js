const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class PhysicalInteractionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;

    let hFunc = intn.elements().map(el =>{
      return h('div', [h(EntityForm, {entity:el, placeholder:'Molecule', tooltipContent:'Name or ID', style: 'form-entity-small'})
      ]);
    });

    return h('div.form-interaction', [
      ...hFunc,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: e => {this.addEntityRow();}},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }

}
module.exports = PhysicalInteractionForm;