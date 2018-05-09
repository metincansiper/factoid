const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class ExpressionRegulationForm extends InteractionForm {


  render(){
    const intn = this.state.interaction;
    const lEnt = this.getInputParticipants()[0];
    const rEnt = this.getOutputParticipants()[0];

    let actVal =  intn.association().isInhibition()? "inhibits" : "activates" ;


    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Enter transcription factor', document: this.state.document}),
      h('span', [
        h('select.form-options', { value: actVal, onChange: e => this.updateActivationInhibition(e.target.value) }, [
            h('option', { value: 'activates' }, 'activates expression'),
            h('option', { value: 'inhibits' }, 'inhibits expression'),
        ])
      ]),
      h(EntityForm, { entity: rEnt, placeholder: 'Enter target protein' , document: this.state.document} ),
    ]);

  }
}
module.exports = ExpressionRegulationForm;