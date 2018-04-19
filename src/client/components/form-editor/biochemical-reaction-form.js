const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class BiochemicalReactionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;

    let hFuncInput = intn.elements().map(el =>{
      // if(el.description() === 'input')
      if(el[intn.id()] === 0)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Input small molecules', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
      else
        return null;
    });

    let hFuncOutput = intn.elements().map(el =>{
      // if(el.description() === 'output')
      if(el[intn.id()] === 2)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Output small molecules', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
    else
      return null;
    });

    let hFuncCatalyzer = intn.elements().map(el =>{
      // if(el.description() === 'catalyzer')
      if(el[intn.id()] === 1)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Catalyzer', tooltipContent:'Name or ID', document: this.state.document})
        ]);
      else
        return null;
    });

    intn.elements().map(el => {
      // if(el.description()==='output')
      if(el[intn.id()] === 2)
        intn.setParticipantType(el, 'positive');
    });


    return h('div.form-interaction', [
      ...hFuncInput,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: e => this.addEntityRow({description:'input'})},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),
      ...hFuncCatalyzer,
       ...hFuncOutput,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: e => this.addEntityRow({description:'output'})},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),

    ]);
  }
}
module.exports = BiochemicalReactionForm;