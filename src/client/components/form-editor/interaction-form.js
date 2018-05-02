const { Component } = require('react');
const _ = require('lodash');


class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      id: props.id,
      interaction: props.interaction,
      description: props.description,
      document: props.document,
      caller: props.caller
    };

    this.state.document.synch();
  }

  //Returns the interaction participant with the given index
  getEntityForParticipantIndex(ind){
    const intId = this.state.interaction.id();

    return this.state.interaction.participants().filter(el =>  el.description()[intId] === ind)[0];
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
      .then( () => { this.state.interaction.addParticipant(el)} )
      .then(() => this.setState(this.state));
  }



  updateActivationInhibition(val){
    let intn = this.state.interaction;
    let rEnt = this.getEntityForParticipantIndex(1);

    if(val.indexOf("activ") > -1)
      intn.association().setAsPromotionOf(rEnt);
    else
      intn.association().setAsInhibitionOf(rEnt);

    this.forceUpdate();

  }
}

module.exports = InteractionForm;

