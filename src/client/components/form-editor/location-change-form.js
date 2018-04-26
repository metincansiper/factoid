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

  setLocation(ind, loc){

    const intn = this.state.interaction;
    let desc = intn.description();

    let words = desc.split(' ');

    if(words.length > ind)
      words[ind] = loc;

    else
      words.push(loc);


    intn.description(words.join(' '));

    this.setState(this.state);

  }




  render(){
    const intn = this.state.interaction;

    const lEnt = this.getEntityForParticipantIndex(0);
    const rEnt = this.getEntityForParticipantIndex(1);
    const oldLocationInd = 3;
    const newLocationInd = 5;


    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Controller protein', tooltipContent:'Name or ID', style: 'form-entity-medium', document: this.state.document}),
      h('span', [
          h('select.form-options-long', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
              h('option', { value: 'activates translocation from ' + this.getLocation(oldLocationInd) + ' to ' + this.getLocation(newLocationInd) }, 'activates translocation'),
              h('option', { value: 'inhibits translocation from' + this.getLocation(oldLocationInd) + ' to ' + this.getLocation(newLocationInd)  }, 'inhibits translocation'),
          ])
      ]),

      h('h3.form-entity-title', 'of'),

      h(EntityForm, { entity: rEnt , placeholder: 'Molecule', tooltipContent:'Gene symbol, Uniprot ID or Chebi ID', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'from'),

      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.getLocation(oldLocationInd),
          placeholder: 'Old location',
          onChange: e => this.setLocation(oldLocationInd, e.target.value)
        })
      ]),

      // h(EntityForm, { entity: oldLocEnt, placeholder: 'Old location', style: 'form-entity-medium', document: this.state.document}),
      h('h3.form-entity-title', 'to'),
      h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.getLocation(newLocationInd),
          placeholder: 'Old location',
          onChange: e => this.setLocation(newLocationInd, e.target.value)
        })
      ])
      // h(EntityForm, { entity: newLocEnt, placeholder: 'New location' , style: 'form-entity-medium', document: this.state.document}),
    ]);
  }
}


module.exports = LocationChangeForm;