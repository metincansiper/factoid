const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');



class ProteinModificationForm extends InteractionForm {

  // componentDidMount(){
  //   let intn = this.state.interaction;
  //   let rEnt = this.getEntityForParticipantIndex(1);
  //
  //   intn.association().setAsPromotionOf(rEnt);
  //
  //   intn.association().setModificationType("phosphorylation");
  //
  // }


  updateModificationType(val){
    let intn = this.state.interaction;
    intn.association().setModificationType(val);

    this.forceUpdate();
  }

  render(){

    let intn = this.state.interaction;
    let lEnt = this.getEntityForParticipantIndex(0);
    let rEnt = this.getEntityForParticipantIndex(1);

    let actVal =  intn.association().isInhibition()? "inhibits" : "activates" ;

    let modVal = intn.association().getModificationType() == 'undefined' ? "phosphorylation" : intn.association().getModificationType();


    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt ,   placeholder:'Controller protein', tooltipContent:'Name or ID', document: this.state.document}),
      h('span', [
        h('select.form-options', {id:('activation-'+ intn.id()), value: actVal,
          onChange: e => {


            this.updateActivationInhibition(e.target.value);
          }}, [
          h('option', { value: 'activates'}, 'activates'),
          h('option', { value: 'inhibits'}, 'inhibits'),
        ])
      ]),
      h('span', [
        h('select.form-options', {id:('modification-'+ intn.id()), value: modVal,
          onChange: e => {

            this.updateModificationType(e.target.value);

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