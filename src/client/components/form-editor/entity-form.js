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



    let self = this;
  //listener
    if(this.data.entity){
      this.data.entity.on("complete", () => {
        self.dirty();
      });
    }

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

    if(this.state.entity.completed()) {
      let entity = this.state.entity;
      let mergedEntity;

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


  shouldComponentUpdate(){

     return true;
  }
  componentDidUpdate(){

    //always check this
    this.mergeWithOtherEntities();
    return true;
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
        onMouseOver: ()=>{self.isMouseOver = true; },
        onMouseOut: ()=>{self.isMouseOver = false;},
        // id: 'entity-form-' + this.state.entity.id(),
        value: this.state.entity && this.state.entity.name(),
        placeholder: this.state.placeholder,
        onChange: e => this.updateEntityName(e.target.value),
      }),
      hCompletedStatus
    ]);



    hFunc = h(Popover, {
      tippy: {
        placement: 'top',
        hideOnClick: false,
        trigger: 'click mouseenter',
        wait: function (show, event) {

          let delay = 2000;
          if(event.type === 'click') {
            delay = 0;
          }

          setTimeout(()=>{
            if(self.state.entity.name().length > 0 && self.isMouseOver)
                show();
          }, delay);

        },
        // html: h(ElementInfo, {key:this.state.entity.name(), element: this.state.entity, document: this.state.document})
        html: h(ElementInfo, {key:this.state.entity.name(), element: this.state.entity, document: this.state.document})
      }}, [hFunc]);



    return hFunc;
  }
}

module.exports = EntityForm;

