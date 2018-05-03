const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class LocationChangeForm extends InteractionForm {



  setOldLocation(loc){

    const intn = this.state.interaction;
    intn.association().setOldLocation(loc);

    console.log(loc);
    this.forceUpdate();
  }


  setNewLocation(ind, loc){

    const intn = this.state.interaction;
    intn.association().setNewLocation(loc);
    this.forceUpdate();

  }

  // componentDidUpdate(){
  //   console.log(this.state.interaction.association().toString());
  //   console.log(this.state.interaction.association().getOldLocation());
  //   console.log(this.state.interaction.association().getNewLocation());
  // }

  render(){
    const intn = this.state.interaction;

    const lEnt = this.getEntityForParticipantIndex(0);
    const rEnt = this.getEntityForParticipantIndex(1);


    let actVal =  intn.association().isInhibition()? "inhibits" : "activates" ;



    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Controller protein', tooltipContent:'Name or ID', style: 'form-entity-medium', document: this.state.document}),
      h('span', [
          h('select.form-options-long', { value: actVal, onChange: e => this.updateActivationInhibition(e.target.value) }, [
              h('option', { value: 'activates' }, 'activates translocation'),
              h('option', { value: 'inhibits' }, 'inhibits translocation'),
          ])
      ]),

      h('h3.form-entity-title', 'of'),

      h(EntityForm, { entity: rEnt , placeholder: 'Molecule', tooltipContent:'Gene symbol, Uniprot ID or Chebi ID', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'from'),

      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: intn.association().getOldLocation(),
          placeholder: 'Old location',
          onChange: e => this.setOldLocation(e.target.value)
        })
      ]),

      h('h3.form-entity-title', 'to'),
      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: intn.association().getNewLocation(),
          placeholder: 'New location',
          onChange: e => this.setNewLocation( e.target.value)
        })
      ])
    ]);
  }
}


module.exports = LocationChangeForm;