const DirtyComponent = require('../dirty-component');
const _ = require('lodash');
const h = require('react-hyperscript');
const Popover = require('../popover/popover');

// const Poppy = require('../popover/poppy');
const ElementInfo = require('../element-info/element-info');


class EntityForm extends DirtyComponent {
  constructor(props) {
    super(props);
    this.state = this.data = _.assign( {
      style: 'form-entity',
      showEntityInfo: false,
    }, props );


    this.notification = new Notification({ active: true });
  }

  updateEntityName(newName) {
    this.state.entity.name(newName);
    // this.setState(this.state);

    if (this.state.entity.name().length > 0)
      this.state.showEntityInfo = true;
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

            let desc = mergedEntity.description();
            desc[intn.id()] = entity.description()[intn.id()];
            mergedEntity.redescribe(desc);
            intn.addParticipant(mergedEntity);
            // intn.replaceParticipant(entity, mergedEntity);
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

  componentDidMount(){
    this.state.entity.name('');
  }

  shouldComponentUpdate(){

     return true;
  }
  componentDidUpdate(){

    //always check this
    this.mergeWithOtherEntities();
    return true;
  }

  updateCompleted(){
    if(this.state.entity.completed())
      this.forceUpdate();

  }
  render(){
    let self = this;
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
      }),
      hCompletedStatus
    ]);



    hFunc = h(Popover, {
      parent: this,
      tippy: {
        placement: 'top',
        hideOnClick: false,
        trigger: 'manual click',
        wait: function (show, event) {

          if(event.type === 'click' && self.state.entity.name().length > 0) {
            show();
            //update completed status and show

            // self.state.isComplete = self.state.entity.completed();
            // if(this.state.isComplete) {
            //   hCompletedStatus = h('i.material-icons.entity-info-complete-icon', 'check_circle');
            //
            // }

            self.updateCompleted();

          }

        },
        // html: h(ElementInfo, {key:this.state.entity.name(), element: this.state.entity, document: this.state.document})
        html: h(ElementInfo, {key:this.state.entity.name(), element: this.state.entity, document: this.state.document})
      }}, [hFunc]);



    return hFunc;
  }
}

module.exports = EntityForm;

