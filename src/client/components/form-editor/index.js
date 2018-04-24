const DirtyComponent = require('../dirty-component');
const h = require('react-hyperscript');
const io = require('socket.io-client');
const _ = require('lodash');

const logger = require('../../logger');
const debug = require('../../debug');

const Document = require('../../../model/document');

const DocumentWizardStepper = require('../document-wizard-stepper');
const AppBar = require('../app-bar');


const ProteinModificationForm = require('./protein-modification-form');
const ComplexInteractionForm = require('./complex-interaction-form');
const ExpressionRegulationForm = require('./expression-regulation-form');
const BiochemicalReactionForm = require('./biochemical-reaction-form');
const LocationChangeForm = require('./location-change-form');
const PhysicalInteractionForm = require('./physical-interaction-form');
const ActivationInhibitionForm = require('./activation-inhibition-form');


class FormEditor extends DirtyComponent {
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

    for(let i = 0; i < data.entityCnt; i++)
        entArr.push(self.addElement({description: {}}));

    let intn = this.addInteraction(data);


    entArr.push(intn);


    Promise.all(entArr).then(responses => {
      let resp = responses[data.entityCnt]; // this it the interaction

      for(let i = 0; i < data.entityCnt; i++) {
        //TODO: move this from description to its own field
        let desc = responses[i].description();
        desc[resp.id()] = i;
        responses[i].redescribe(desc);
        resp.addParticipant(responses[i]);
      }
      this.dirty();
    });
  }


  deleteInteractionRow(data){

    let doc = this.state.document;
    let intn = data.interaction;

    let els = intn.elements();
    let elsLength = els.length;


    let promiseArr = [];
    for(let i = 0; i < elsLength; i++) {
      promiseArr.push(Promise.try(() => intn.removeParticipant(els[i]))
        .then(()=>{
          if(Object.keys(els[i].description()).length <= 1) // entity is in another interaction as well
            doc.remove(els[i]);
          else{
          //  only remove this interaction's key from the description
            let desc = els[i].description();
            delete desc[intn.id()];
            els[i].redescribe(desc);
          }

        }
      ));
    }

    Promise.all(promiseArr).then( () => {
      doc.remove(intn);
      this.dirty();
    });

  }



  //TODO: This will test validity of entries first
  //Convert to biopax or show in the editor
  submit(){

    let doc = this.state.document;
    doc.interactions().map(interaction=>{
      console.log(interaction);
      interaction.elements().map(el => {
        console.log(el.name());
        console.log(el);
      });

    });

  }

  render(){
    let doc = this.state.document;
    let self = this;

    this.state.dirty = false;

    const forms = [
      {type: 'Protein Modification' , clazz: ProteinModificationForm,entityCnt: 2, description:"One protein chemically modifies another protein.", defaultDescription: "activates-phosphorylation"},
      {type:'Complex Association', clazz: ComplexInteractionForm, entityCnt: 2, description: "Multiple proteins come together to form a complex molecule.", defaultDescription: "form a complex"},
      {type:'Complex Dissociation', clazz: ComplexInteractionForm, entityCnt: 2, description: "A complex molecule's members get separated.", defaultDescription: "dissociate from a complex"},
      {type:'Location Change', clazz: LocationChangeForm, entityCnt:4, description: "One protein activates or inhibits cellular location change in another protein.", defaultDescription: "activates location change"},
      {type:'Biochemical Reaction', clazz: BiochemicalReactionForm, entityCnt: 3, description: "One or more small molecules turn into other small molecules by the action of an enzyme.", defaultDescription: "catalyzes"},
      {type:'Physical Interaction', clazz: PhysicalInteractionForm, entityCnt: 2, description: "Two or more proteins physically interact as members in a complex.", defaultDescription: "physically interact"},
      {type:'Activation Inhibition', clazz:ActivationInhibitionForm, entityCnt: 2, description: "A protein changes the activity status of another protein.", defaultDescription: "activates"},
      {type:'Expression Regulation', clazz: ExpressionRegulationForm, entityCnt: 2, description: "A protein changes mRNA expression of a gene.", defaultDescription: "activates expression"}
    ];

    let hArr = [];


    forms.forEach(function(form){

      let formContent = doc.interactions().map(interaction => {
        if(interaction.name() === form.type)
          return h('div.form-interaction-line',
            [
              h(form.clazz, {key: interaction.id(), document:doc, interaction:interaction, description: form.type}),
              h('button.delete-interaction', { onClick: e => {self.deleteInteractionRow({interaction:interaction}); } }, 'X')
            ] );
          else return null;
      });


      //update form
      let hFunc = h('div.form-template-entry', [
        h('h2', form.type),
        h('p', form.description),
        ...formContent,
        h('div.form-action-buttons', [
          h('button.form-interaction-adder', { onClick: e => self.addInteractionRow({name:form.type, entityCnt:form.entityCnt,  description: form.defaultDescription})}, [
            h('i.material-icons.add-new-interaction-icon', 'add'),
            'ADD INTERACTION'
          ])])
      ]);

      hArr.push(hFunc);
    });

    return h('div.form-editor', [
      h(AppBar, { document: this.data.document }),
      h('div.page-content', [
        h('h1.form-editor-title', 'Insert Pathway Information As Text'),
        h('div.form-templates', [
          ...hArr
        ]),
        h('button.form-submit', { onClick: e => this.submit() }, [
          'SUBMIT'
        ])
      ]),
      h(DocumentWizardStepper, {
        backEnabled: false,
        // TODO
      })
    ]);
  }
}

module.exports = FormEditor;
