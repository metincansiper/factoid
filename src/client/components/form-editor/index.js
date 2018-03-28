const { Component } = require('react');
const h = require('react-hyperscript');
const io = require('socket.io-client');
const _ = require('lodash');


const logger = require('../../logger');
const debug = require('../../debug');

const Document = require('../../../model/document');

const DocumentWizardStepper = require('../document-wizard-stepper');


class EntityForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      entity: props.entity,
      placeholder: props.placeholder
    };
  }

  updateEntityName( newName ){
    this.state.entity.name( newName );
    this.forceUpdate();
  }
  render(){
    return h('div.form-interaction', [
      h('input[type="text"].form-entity', {
      value: this.state.entity.name(),
      placeholder: this.state.placeholder,
      onChange: e => this.updateEntityName(e.target.value)
    })]);
  }
}

class MultipleEntityForm extends EntityForm {
  render(){
    return h('div.form-interaction', [h('textarea.form-multiple-entity"', {
      value: this.state.entity.name(),
      placeholder: this.state.placeholder,
      onChange: e => this.updateEntityName(e.target.value)
    })]);
  }
}

class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      interaction: props.interaction,
      document: props.document
    };
  }

  deleteInteraction(){
    let doc = this.state.document;
    let intn = this.state.interaction;

    let els = intn.elements();
    let elsLength = els.length;

    let promiseArr = [];
    for(let i = 0; i < elsLength; i++)
      promiseArr.push(Promise.try( () => els[i].synch()).then(() => intn.removeParticipant(els[i])));

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

class ProteinModificationForm extends InteractionForm {
  render(){

    let intn = this.state.interaction;

    if(intn.deleted)
      return null;

    let lEnt = intn.elements()[0];
    let rEnt = intn.elements()[1];

    let actVal = intn.description().split('\t')[0];
    let modVal = intn.description().split('\t')[1];


    //Treat two options(activation + modification) as one interaction type
    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt ,  placeholder:'Enter controller protein'}),
      h('span', [
        h('select.form-options', {id:('activation-'+ intn.id()), value: actVal,
          onChange: e => {
            let actStatus = e.target.value;
            let e2 = document.getElementById('modification-'+ intn.id());
            let modStatus = e2.options[e2.selectedIndex].value;
            this.updateInteractionType(actStatus + '\t' + modStatus);
          }}, [
            h('option', { value: 'activates'}, 'activates'),
            h('option', { value: 'inhibits'}, 'inhibits'),
        ])
      ]),
      h('span', [
        h('select.form-options', {id:('modification-'+ intn.id()), value: modVal,
          onChange: e => {
            let modStatus = e.target.value;
            let e2 = document.getElementById('activation-'+ intn.id());
            let actStatus = e2.options[e2.selectedIndex].value;
            this.updateInteractionType(actStatus + '\t' + modStatus);
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
      h(EntityForm, { entity: rEnt, placeholder:'Enter controlled protein' } ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }
}

class ComplexInteractionForm extends InteractionForm {
  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;

    const lEnt = intn.elements()[0];

    return h('div.form-interaction', [
      h(MultipleEntityForm, { entity: lEnt , placeholder: 'Enter molecule list'}),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }
}

class LocationChangeForm extends InteractionForm {

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;

    const lEnt = intn.elements()[0];
    const rEnt = intn.elements()[1];
    const oldLocEnt = intn.elements()[2];
    const newLocEnt = intn.elements()[3];

    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Enter controller protein'}),
      h('span', [
          h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
              h('option', { value: 'activates' }, 'activates'),
              h('option', { value: 'inhibits' }, 'inhibits'),
          ])
      ]),
      //TODO: will be separately added as ID and type
      h(MultipleEntityForm, { entity: rEnt , placeholder: 'Enter molecule list'}),
      h(EntityForm, { entity: oldLocEnt, placeholder: 'Enter old location' } ),
      h(EntityForm, { entity: newLocEnt, placeholder: 'Enter new location' } ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }
}

class BiochemicalReactionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;
    const inputSmallMolecules = intn.elements()[0];
    const catalyzer = intn.elements()[1];
    const outputSmallMolecules = intn.elements()[2];

    // return h('div', 'a');
    return h('div.form-interaction', [
      h(MultipleEntityForm, { entity: inputSmallMolecules , placeholder: 'Enter input small molecules'}),
      h(EntityForm, { entity: catalyzer , placeholder: 'Enter catalyzer'}),
      h(MultipleEntityForm, { entity: outputSmallMolecules , placeholder: 'Enter output small molecules'}),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }
}

class PhysicalInteractionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;
    const lEnt = intn.elements()[0];
    const rEnt = intn.elements()[1];

    return h('div.form-interaction', [
      h(MultipleEntityForm, { entity: lEnt , placeholder: 'Enter molecule list'}),
      h('h3.form-entity-title', 'interact(s) with'),
      h(MultipleEntityForm, { entity: rEnt, placeholder: 'Enter entity list' } ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);
  }

}

class ActivationInhibitionForm extends InteractionForm{

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;
    const lEnt = intn.elements()[0];
    const rEnt = intn.elements()[1];

    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Enter source protein'}),
      h('span', [
        h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
          h('option', { value: 'activates' }, 'activates'),
          h('option', { value: 'inhibits' }, 'inhibits'),
        ])
      ]),
      h(EntityForm, { entity: rEnt, placeholder: 'Enter target protein' } ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);

    }
}


class ExpressionRegulationForm extends InteractionForm {

  render(){
    const intn = this.state.interaction;
    if(intn.deleted)
      return null;
    const lEnt = intn.elements()[0];
    const rEnt = intn.elements()[1];

    return h('div.form-interaction', [
      h(EntityForm, { entity: lEnt , placeholder: 'Enter transcription factor'}),
      h('span', [
        h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
            h('option', { value: 'activates' }, 'activates expression'),
            h('option', { value: 'inhibits' }, 'inhibits expression'),
        ])
      ]),
      h(EntityForm, { entity: rEnt, placeholder: 'Enter target protein' } ),
      h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
    ]);

  }
}

// TODO actually build a working UI that's hooked into the model
class FormEditor extends Component {
  constructor(props){
    super(props);

    let docSocket = io.connect('/document');
    let eleSocket = io.connect('/element');

    let logSocketErr = (err) => logger.error('An error occurred during clientside socket communication', err);

    docSocket.on('error', logSocketErr);
    eleSocket.on('error', logSocketErr);

    let id = _.get( props, 'id' );
    let secret = _.get( props, 'secret' );

    let doc = new Document({
      socket: docSocket,
      factoryOptions: { socket: eleSocket },
      data: { id, secret }
    });

    this.data = this.state = {
      document: doc
    };

    Promise.try( () => doc.load() )
      .then( () => logger.info('The doc already exists and is now loaded') )
      .catch( err => {
        logger.info('The doc does not exist or an error occurred');
        logger.warn( err );

        return ( doc.create()
          .then( () => logger.info('The doc was created') )
          .catch( err => logger.error('The doc could not be created', err) )
        );
      } )
      .then( () => doc.synch(true) )
      .then( () => logger.info('Document synch active') )
      .then( () => {

        if( debug.enabled() ){
          window.doc = doc;
          window.editor = this;
        }

        // force an update here

        this.forceUpdate();
        logger.info('The editor is initialising');
      } );

  }

  setData( obj, callback ){
    _.assign( this.data, obj );

    this.setState( obj, callback );
  }

  addElement( data){

    let doc = this.data.document;


    let el = doc.factory().make({
      data: _.assign( {
        type: 'entity',
        name: ''

      }, data )
    });

    return ( Promise.try( () => el.synch() )
      .then( () => el.create() )
      .then( () => doc.add(el) )
      .then( () => el )
    );
  }

  addInteraction( data ){
    return this.addElement( _.assign({
        type: 'interaction',
        name: '',
        subtype: data.subtype
    }, data) );
  }


  addInteractionRow(data){
    let self = this;
    let entArr = [];

    for(let i = 0; i < data.entityCnt; i++)
        entArr.push(self.addElement());

    let intn = this.addInteraction(data);
    entArr.push(intn);


    Promise.all(entArr).then(responses => {
      let resp = responses[data.entityCnt];

      for(let i = 0; i < data.entityCnt; i++)
          resp.addParticipant(responses[i]);

      this.forceUpdate();
    });

  }
  //TODO: link this to biopax model
  submit(){

  }


  render(){
    let doc = this.state.document;
    let self = this;

    const forms = [
      {type: 'PROTEIN_MODIFICATION' , clazz: ProteinModificationForm, entityCnt: 2},
      {type:'COMPLEX_ASSOCIATION', clazz: ComplexInteractionForm, entityCnt: 1},
      {type:'COMPLEX_DISSOCIATION', clazz: ComplexInteractionForm, entityCnt: 1},
      {type:'LOCATION_CHANGE', clazz: LocationChangeForm, entityCnt: 4},
      {type:'BIOCHEMICAL_REACTION', clazz: BiochemicalReactionForm, entityCnt: 3},
      {type:'PHYSICAL_INTERACTION', clazz: PhysicalInteractionForm, entityCnt: 2},
      {type:'ACTIVATION_INHIBITION', clazz:ActivationInhibitionForm, entityCnt: 2},
      {type:'EXPRESSION_REGULATION', clazz: ExpressionRegulationForm, entityCnt: 2}
    ];

    let hArr = [];


    forms.forEach(function(form){

      let formContent = doc.interactions(form.type).map(interaction => {
        return h(form.clazz, {document:doc, interaction:interaction});
      });

      //update form
      let hFunc = h('div', [
        h('h2', form.type),
        ...formContent,
        h('div.form-action-buttons', [
          h('button.form-interaction-adder', { onClick: e => self.addInteractionRow({subtype:form.type, entityCnt:form.entityCnt})}, [
            h('i.material-icons.add-new-interaction-icon', 'add'),
            'ADD INTERACTION'
          ])])
      ]);

      hArr.push(hFunc);
    });

    return h('div.document-form.page-content', [
      h('h1.form-editor-title', 'Insert Pathway Information As Text'),
        ...hArr,

      h('button.form-submit', { onClick: e => this.submit() }, [
        'SUBMIT'
      ]),

      h(DocumentWizardStepper, {
        backEnabled: false,
        // TODO
      })
    ]);
  }
}

module.exports = FormEditor;
