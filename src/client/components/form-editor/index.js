const { Component } = require('react');
const h = require('react-hyperscript');
const io = require('socket.io-client');
const _ = require('lodash');

const logger = require('../../logger');
const debug = require('../../debug');

const Document = require('../../../model/document');

const DocumentWizardStepper = require('../document-wizard-stepper');


const ProteinModificationForm = require('./protein-modification-form');
const ComplexInteractionForm = require('./complex-interaction-form');
const ExpressionRegulationForm = require('./expression-regulation-form');
const BiochemicalReactionForm = require('./biochemical-reaction-form');
const LocationChangeForm = require('./location-change-form');
const PhysicalInteractionForm = require('./physical-interaction-form');
const ActivationInhibitionForm = require('./activation-inhibition-form');


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
        name: data.name,
        description: ''
    }, data) );
  }


  addInteractionRow(data){
    let self = this;
    let entArr = [];
    const entityCnt = data.entityDescriptions.length;

    for(let i = 0; i < entityCnt; i++)
        entArr.push(self.addElement({description: data.entityDescriptions[i]}));

    let intn = this.addInteraction(data);
    entArr.push(intn);


    Promise.all(entArr).then(responses => {
      let resp = responses[entityCnt];

      for(let i = 0; i < entityCnt; i++)
          resp.addParticipant(responses[i]);

      this.forceUpdate();
    });

  }
  //TODO: This will test validity of entries first
  //Convert to biopax or show in the editor
  submit(){

    let doc = this.state.document;
    doc.interactions().map(interaction=>{
      console.log(interaction.name());
      console.log(interaction.description());
      interaction.elements().map(el => {
        console.log(el.name());
      });

    });

  }



  render(){
    let doc = this.state.document;
    let self = this;

    const forms = [
      {type: 'Protein Modification' , clazz: ProteinModificationForm,entityDescriptions:['input', 'output'], description:"One protein chemically modifies another protein.", defaultDescription: "activates-phosphorylation"},
      {type:'Complex Association', clazz: ComplexInteractionForm, entityDescriptions: ['input'], description: "Multiple proteins come together to form a complex molecule.", defaultDescription: "form a complex"},
      {type:'Complex Dissociation', clazz: ComplexInteractionForm, entityDescriptions: ['input'], description: "A complex molecule's members get separated.", defaultDescription: "dissociate from a complex"},
      {type:'Location Change', clazz: LocationChangeForm, entityDescriptions: ['input','output', 'input', 'output'], description: "One protein activates or inhibits cellular location change in another protein.", defaultDescription: "activates location change"},
      {type:'Biochemical Reaction', clazz: BiochemicalReactionForm, entityDescriptions: ['input','catalyzer', 'output'], description: "One or more small molecules turn into other small molecules by the action of an enzyme.", defaultDescription: "catalyzes"},
      {type:'Physical Interaction', clazz: PhysicalInteractionForm, entityDescriptions: ['input'], description: "Two or more proteins physically interact as members in a complex.", defaultDescription: "physically interact"},
      {type:'Activation Inhibition', clazz:ActivationInhibitionForm, entityDescriptions: ['input', 'output'], description: "A protein changes the activity status of another protein.", defaultDescription: "activates"},
      {type:'Expression Regulation', clazz: ExpressionRegulationForm, entityDescriptions: ['input', 'output'], description: "A protein changes mRNA expression of a gene.", defaultDescription: "activates expression"}
    ];

    let hArr = [];


    forms.forEach(function(form){


      let formContent = doc.interactions().map(interaction => {
        if(interaction.name() == form.type)
          return h(form.clazz, {document:doc, interaction:interaction, description: form.type});
          else return null;
      });

      //update form
      let hFunc = h('div', [
        h('h2', form.type),
        h('p', form.description),
        ...formContent,
        h('div.form-action-buttons', [
          h('button.form-interaction-adder', { onClick: e => self.addInteractionRow({name:form.type, entityDescriptions:form.entityDescriptions,  description: form.defaultDescription})}, [
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
