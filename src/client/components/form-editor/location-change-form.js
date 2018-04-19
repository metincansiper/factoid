const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class LocationChangeForm extends InteractionForm {

  render(){
    const intn = this.state.interaction;

    const lEnt = this.getEntityForParticipantIndex(0);
    const rEnt = this.getEntityForParticipantIndex(1);
    const oldLocEnt = this.getEntityForParticipantIndex(2);
    const newLocEnt = this.getEntityForParticipantIndex(3);


    intn.setParticipantType(newLocEnt, 'positive');
    intn.setParticipantType(oldLocEnt, 'negative');


    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Controller protein', tooltipContent:'Name or ID', style: 'form-entity-medium', document: this.state.document}),
      h('span', [
          h('select.form-options-long', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
              h('option', { value: 'activates location change' }, 'activates location change'),
              h('option', { value: 'inhibits location change' }, 'inhibits location change'),
          ])
      ]),

      h(EntityForm, { entity: rEnt , placeholder: 'Molecule', tooltipContent:'Gene symbol, Uniprot ID or Chebi ID', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'from'),
      h(EntityForm, { entity: oldLocEnt, placeholder: 'Old location', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'to'),
      h(EntityForm, { entity: newLocEnt, placeholder: 'New location' , style: 'form-entity-medium', document: this.state.document}),
    ]);
  }
}


module.exports = LocationChangeForm;