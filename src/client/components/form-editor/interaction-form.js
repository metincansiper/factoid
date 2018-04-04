const { Component } = require('react');
const _ = require('lodash');

class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      interaction: props.interaction,
      description: props.description,
      document: props.document
    };
  }
  addEntityRow(data){

    let doc = this.state.document;

    let el = doc.factory().make({
      data: _.assign( {
        type: 'entity',
        name: ''

      }, data )
    });

    Promise.try( () => el.synch() )
      .then( () => el.create() )
      .then( () => doc.add(el) )
      .then( () => el )
      .then( () => this.state.interaction.addParticipant(el) )
      .then(() => this.forceUpdate());
  }

  deleteInteraction(){
    let doc = this.state.document;
    let intn = this.state.interaction;

    let els = intn.elements();
    let elsLength = els.length;

    let promiseArr = [];
    for(let i = 0; i < elsLength; i++)
      promiseArr.push(Promise.try( () => els[i].synch()).then(() => intn.removeParticipant(els[i])).then(doc.remove(els[i])));

    Promise.all(promiseArr).then( () => {

      doc.remove(intn);
      intn.deleted = true;

      this.setState(this.state);
      this.forceUpdate();
    });

  }


  updateInteractionType(nextType){
    const intn = this.state.interaction;
    intn.description(nextType);
    this.forceUpdate();
  }
}

module.exports = InteractionForm;

