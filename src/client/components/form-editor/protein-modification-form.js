const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');



class ProteinModificationForm extends InteractionForm {
  render(){


    let intn = this.state.interaction;
    let lEnt = this.getEntityForParticipantIndex(0);
    let rEnt = this.getEntityForParticipantIndex(1);



    let actVal = intn.description().split('-')[0];
    let modVal = intn.description().split('-')[1];

    intn.description(actVal+ "-" + modVal);

    if(actVal.indexOf("activate")> - 1)
      intn.setParticipantType(rEnt, 'positive');
    else
      intn.setParticipantType(rEnt, 'negative');


    //Treat two options(activation + modification) as one interaction type
    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt ,   placeholder:'Controller protein', tooltipContent:'Name or ID', document: this.state.document}),
      h('span', [
        h('select.form-options', {id:('activation-'+ intn.id()), value: actVal,
          onChange: e => {
            let actStatus = e.target.value;
            let e2 = document.getElementById('modification-'+ intn.id());
            let modStatus = e2.options[e2.selectedIndex].value;
            this.updateInteractionType(actStatus + '-' + modStatus);
          }}, [
          h('option', { value: 'activates'}, 'activates'),
          h('option', { value: 'inhibits'}, 'inhibits'),
        ])
      ]),
      h('span', [
        h('select.form-options', {id:('modification-'+ intn.id()), value: modVal,
          onChange: e => {
            let modStatus = e.target.value;
            let e2 = document.getElementById('activation-'+ intn.id());
            let actStatus = e2.options[e2.selectedIndex].value;
            this.updateInteractionType(actStatus + '-' + modStatus);
          }}, [
          h('option', { value: 'phosphorylation' }, 'phosphorylation'),
          h('option', { value: 'methylation' }, 'methylation'),
          h('option', { value: 'acetylation' }, 'acetylation'),
          h('option', { value: 'amidation' }, 'amidation'),
          h('option', { value: 'pyrrolidone carboxylic acid' }, 'pyrrolidone carboxylic acid'),
          h('option', { value: 'isomerization' }, 'isomerization'),
          h('option', { value: 'hydroxilation' }, 'hydroxilation'),
          h('option', { value: 'sulfation' }, 'sulfation'),
          h('option', { value: 'flavin-binding' }, 'flavin-binding'),
          h('option', { value: 'cysteine oxidation and nitrosylation' }, 'cysteine oxidation and nitrosylation'),
          h('option', { value: 'other' }, 'other')
        ])
      ]),
      h(EntityForm, { entity: rEnt, placeholder:'Controlled protein' , tooltipContent:'Name or ID', document: this.state.document} )

    ]);
  }
}

module.exports = ProteinModificationForm;