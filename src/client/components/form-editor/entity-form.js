const DirtyComponent = require('../dirty-component');
const _ = require('lodash');
const h = require('react-hyperscript');
const Popover = require('../popover/popover');
// const Popover = require('./popover');
const ElementInfo = require('../element-info/element-info');


class EntityForm extends DirtyComponent {
  constructor(props) {
    super(props);
    this.state = this.data = _.assign( {
      style: 'form-entity',
      showEntityInfo: false
    }, props );
  }

  updateEntityName(newName) {
    this.state.entity.name(newName);
    this.setState(this.state);
    this.dirty();
  }

  updateGrounding(stateVal) {

      if (this.state.entity.name().length > 0) {
          // this.state.showEntityInfo = stateVal;
          this.setState({showEntityInfo: stateVal});
      }
    this.dirty();
  }

  areAssociationsTheSame(assoc1, assoc2){
    return (assoc1.id === assoc2.id && assoc1.modification === assoc2.modification && assoc1.organism === assoc2.organism);
  }

  /***
   * Combine the completed entities if they have the same grounding information and database id
   */
  mergeWithOtherEntities(){

    if(this.state.entity.completed()) {  //TODO: open this
      let entity = this.state.entity;
      let mergedEntity;

      //TODO : open this -- not to skip grounding

      //we can assume that all the other elements in the list are unique as we replace them immediately
      for(let i = 0; i < this.state.document.entities().length; i++) {
        let el = this.state.document.entities()[i];
        if (el.id() !== entity.id() && el.completed()) {
          if (this.areAssociationsTheSame(el.association(), entity.association())) {

            mergedEntity = el;

            console.log("merging the two " + this.state.entity.id() + " and " + el.id());
            break;
          }
        }
      }


//     //todo: opent this to skip grounding
//       for(let i = 0; i < this.state.document.entities().length; i++) {
//         let el = this.state.document.entities()[i];
//         if (el.id() !== entity.id() && entity.name().length > 0 && el.name() == entity.name()) {
//
//             mergedEntity = el;
// ;
//             console.log("merging the two " + this.state.entity.id() + " and " + el.id());
//             break;
//           }
//         }
//


        // //find the entity index

      if(mergedEntity) {

        //update the interactions containing this entity
        let updateParticipants = ((intn) => {
          if( intn.has( entity )) {


            mergedEntity.description[intn.id()] = entity.description[intn.id()];
            intn.addParticipant(mergedEntity);
            // intn.replaceParticipant(entity, mergedEntity);


            // let entInd = intn.participants().indexOf(entity);
            //
            // console.log(entInd);
            //
            // //to shift others
            // let restParticipants = _.clone(intn.participants());
            // for(let i = entInd; i < intn.participants().length; i++){
            //   intn.removeParticipant(intn.participants()[i]);
            // }
            // intn.addParticipant(mergedEntity);
            //
            // console.log(restParticipants.length);
            // //add others back
            // for(let i = entInd + 1; i < restParticipants.length; i++){
            //   intn.addParticipant(restParticipants[i]);
            // }
            //

            // intn.setParticipantType(mergedEntity, intn.getParticipantType(entity));
          }
          else
            return Promise.resolve();
        });

        Promise.all(  this.state.document.interactions().map( updateParticipants ) );


        //update the entity of this form
        this.state.entity = mergedEntity;
        //we can now remove our entity
        this.state.document.remove(entity);
      }
    }
  }

  shouldComponentUpdate(){
    return true;
  }
  componentDidUpdate(){
    this.mergeWithOtherEntities();
    return true;
  }

  render(){

    let hFunc;
    let hCompletedStatus;

    if(this.state.entity && this.state.entity.completed())
      hCompletedStatus = h('i.material-icons.entity-info-complete-icon', 'check_circle');
    else
      hCompletedStatus = h('i.material-icons', 'help');

    hFunc = h('div.form-interaction', [
        h('input[type="text"].' + this.state.style, {
          value: this.state.entity && this.state.entity.name(),
          placeholder: this.state.placeholder,
          onChange: e => this.updateEntityName(e.target.value),
          onClick: e => this.updateGrounding(true)
        }),
        hCompletedStatus
      ]);


    if(this.state.showEntityInfo){
      hFunc = h(Popover, {
        tippy: {
          hideOnClick: false,
          html: h(ElementInfo, {key:this.state.entity.name(), element: this.state.entity, document: this.state.document})
        }}, [hFunc]);
    }




    return hFunc;
  }
}

module.exports = EntityForm;

