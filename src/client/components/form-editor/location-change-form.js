const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class LocationChangeForm extends InteractionForm {

  getLocation(ind){
    //Interaction description is in the form: "activates/inhibits translocation from X to Y"
    const intn = this.state.interaction;
    let desc = intn.description();

    let words = desc.split(' ');


    if(words.length > ind)
      return words[ind];

    return "";
  }

  setOldLocation(ind, loc){

    const intn = this.state.interaction;
    let desc = intn.description();

    let words = desc.split(' ');

    words[ind] = loc;

    intn.description(words.join(' '));

    this.setState(this.state);

  }


  setNewLocation(ind, loc){

    const intn = this.state.interaction;
    let desc = intn.description();

    let words = desc.split(' ');

    words[ind-1] = "to";
    words[ind] = loc;


    intn.description(words.join(' '));

    this.setState(this.state);

  }

  render(){
    const intn = this.state.interaction;

    const lEnt = this.getEntityForParticipantIndex(0);
    const rEnt = this.getEntityForParticipantIndex(1);
    const oldLocationInd = 3;
    const newLocationInd = 5;


    let actVal =  intn.association().isInhibition()? "inhibits" : "activates" ;


    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Controller protein', tooltipContent:'Name or ID', style: 'form-entity-medium', document: this.state.document}),
      h('span', [
          h('select.form-options-long', { value: intn.association().toString(), onChange: e => this.updateActivationInhibition(e.target.value) }, [
              h('option', { value: 'activates translocation from ' + this.getLocation(oldLocationInd) + ' to ' + this.getLocation(newLocationInd) }, 'activates translocation'),
              h('option', { value: 'inhibits translocation from ' + this.getLocation(oldLocationInd) + ' to ' + this.getLocation(newLocationInd)  }, 'inhibits translocation'),
          ])
      ]),

      h('h3.form-entity-title', 'of'),

      h(EntityForm, { entity: rEnt , placeholder: 'Molecule', tooltipContent:'Gene symbol, Uniprot ID or Chebi ID', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'from'),

      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.getLocation(oldLocationInd),
          placeholder: 'Old location',
          onChange: e => this.setOldLocation(oldLocationInd, e.target.value)
        })
      ]),

      h('h3.form-entity-title', 'to'),
      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.getLocation(newLocationInd),
          placeholder: 'Old location',
          onChange: e => this.setNewLocation(newLocationInd, e.target.value)
        })
      ])
    ]);
  }
}


module.exports = LocationChangeForm;