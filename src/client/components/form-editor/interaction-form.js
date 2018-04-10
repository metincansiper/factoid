const { Component } = require('react');
const _ = require('lodash');


class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      interaction: props.interaction,
      description: props.description,
      document: props.document,
      caller: props.caller
    };

    this.state.document.synch();

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
      .then( () => this.state.caller.forceUpdate() )
      .then(() => this.setState(this.state));
  }



  componentWillUnmount(){
    console.log("will unmount");
    console.log(this.state.interaction.elements() && this.state.interaction.elements()[0] && this.state.interaction.elements()[0].name());
  }


  updateInteractionType(nextType){
    const intn = this.state.interaction;
    intn.description(nextType);
    // this.forceUpdate();
  }
}

module.exports = InteractionForm;
