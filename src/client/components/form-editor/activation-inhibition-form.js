const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');



class ActivationInhibitionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;
    const lEnt = intn.elements()[0];
    const rEnt = intn.elements()[1];

    if(intn.description().indexOf("activate") > - 1)
      intn.setParticipantType(rEnt, 'positive');
    else
      intn.setParticipantType(rEnt, 'negative');

    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Source protein', document: this.state.document}),
      h('span', [
        h('select.form-options', { value: intn.description(), onChange: e => {this.updateInteractionType(e.target.value);
        } }, [
          h('option', { value: 'activates' }, 'activates'),
          h('option', { value: 'inhibits' }, 'inhibits'),
        ])
      ]),
      h(EntityForm, { entity: rEnt, placeholder: 'Target protein' , document: this.state.document} ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);

    }
}


module.exports = ActivationInhibitionForm;