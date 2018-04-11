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

    if(this.state.entity.completed()) {
      let entity = this.state.entity;

      this.state.document.entities().map((el) => {
        if (el.id() !== entity.id() && el.completed()) {
          if(this.areAssociationsTheSame(el.association(), entity.association())){
            // this.state.document.remove(this.state.entity);
            this.state.entity = el;

            console.log("combined the two " + this.state.entity.id() + " and " +  el.id());
          }
        }

      });
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

