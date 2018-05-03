const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class MolecularInteractionForm extends InteractionForm {


  getNextEntityInd(){
    return this.state.interaction.elements().length;
  }

  updateMolecularInteractionType(val){
    let intn = this.state.interaction;

    intn.association().setMolecularInteractionType(val);

    this.forceUpdate();
  }
  render(){
    const intn = this.state.interaction;
    let intnId = intn.id();

    let intVal = intn.association().getMolecularInteractionType() == 'undefined' ? 'physically interact' : intn.association().getMolecularInteractionType();

    let hFunc = intn.elements().map(el =>{
      return h('div', [h(EntityForm, {entity:el, placeholder:'Molecule', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
    });

    return h('div.form-interaction', [

      ...hFunc,

      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: () => {
              let desc = {};
              desc[intnId] = this.getNextEntityInd();
              this.addEntityRow({description:desc});}},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),
      h('span', [
        h('select.form-options', {id:('interaction-'+ intn.id()), value: intVal,
          onChange: e => {
            this.updateMolecularInteractionType(e.target.value);
          }}, [
          h('option', { value: 'physical interaction'}, 'physically interact'),
          h('option', { value: 'complex association'}, 'form a complex'),
          h('option', { value: 'complex dissociation'}, 'dissociate from a complex'),
        ])
      ]),

    ]);
  }

}
module.exports = MolecularInteractionForm;