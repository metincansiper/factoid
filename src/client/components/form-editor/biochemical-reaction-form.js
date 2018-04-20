const h = require('react-hyperscript');
let InteractionForm = require('./interaction-form.js');
let EntityForm = require('./entity-form.js');


class BiochemicalReactionForm extends InteractionForm {

  getNextEntityInd(isLeft) {
    const intn = this.state.interaction;
    let maxInd = 0;
    for (let i = 0; i < intn.elements().length; i++) {
      let elInd = intn.elements()[i].description()[intn.id()];
      if(isLeft) {
        if (elInd >= 2 &&  elInd % 2 === 1)
          maxInd = i;
      }
      else{
        if (elInd >= 2 && elInd % 2 === 0)
          maxInd = i;
      }
    }


    if(maxInd === 0 && isLeft)
      return 3;

    return maxInd + 2;
  }


  render(){
    const intn = this.state.interaction;
    const intnId = intn.id();

    let hFuncInput = intn.elements().map(el =>{

      if(el.description()[intnId] === 0 || el.description()[intnId] > 2 && el.description()[intnId] % 2 === 1)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Input small molecules', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
      else
        return null;
    });

    let hFuncCatalyzer = intn.elements().map(el =>{
      if(el.description()[intnId] === 1)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Catalyzer', tooltipContent:'Name or ID', document: this.state.document})
        ]);
      else
        return null;
    });

    let hFuncOutput = intn.elements().map(el =>{
      if(el.description()[intnId] === 2 || el.description()[intnId] > 2 && el.description()[intnId] % 2 === 0)
        return h('div', [h(EntityForm, {entity:el, placeholder:'Output small molecules', tooltipContent:'Name or ID', style: 'form-entity-small', document: this.state.document})
      ]);
    else
      return null;
    });


    return h('div.form-interaction', [
      ...hFuncInput,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: () => {
          let desc = {};
          desc[intnId] = this.getNextEntityInd(true);
          this.addEntityRow({description: desc});
        }},
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),
      ...hFuncCatalyzer,
      ...hFuncOutput,
      h('div.form-action-buttons', [
        h('button.form-entity-adder', { onClick: () => {
            let desc = {};
            desc[intnId] = this.getNextEntityInd(false);
            this.addEntityRow({description:desc });
          }}
            ,
          [ h('i.material-icons.add-new-entity-icon', 'add'), ''])
      ]),

    ]);
  }
}
module.exports = BiochemicalReactionForm;