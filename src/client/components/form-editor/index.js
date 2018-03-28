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
        type: props.type
    };
  }

  updateEntityName( newName ){
    this.state.entity.name( newName );
    this.forceUpdate();
  }
  render(){
    return h('div.form-interaction', [ h('h3.form-entity-title', this.state.type), h('input[type="text"].form-entity', {
          value: this.state.entity.name(),
        placeholder: 'Enter entity name',
      onChange: e => this.updateEntityName(e.target.value)
    })]);
  }
}

class MultipleEntityForm extends EntityForm {

    render(){
        return h('div.form-interaction', [h('h3.form-entity-title', this.state.type), h('textarea.form-multiple-entity"', {

            value: this.state.entity.name(),
            placeholder: 'Enter entity list',
            onChange: e => this.updateEntityName(e.target.value)
        })]);
    }
}

class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = this.data = {
      interaction: props.interaction,
    };
  }

  updateInteractionType(nextType){
    const intn = this.state.interaction;
    intn.description(nextType);
    this.forceUpdate();
  }

  // deleteInteraction() {
  //     const intn = this.state.interaction;
  //
  //   // TODO implement this
  // }

}

class ProteinModificationForm extends InteractionForm {
    render(){
        const intn = this.state.interaction;
        const lEnt = intn.elements()[0];
        const rEnt = intn.elements()[1];

        return h('div.form-interaction', [
            h(EntityForm, { entity: lEnt , type: 'Controller protein:'}),
            h('span', [
                h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
                    h('option', { value: 'activates' }, 'activates'),
                    h('option', { value: 'inhibits' }, 'inhibits'),
                ])
            ]),
            h('span', [
                h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
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
            h(EntityForm, { entity: rEnt, type: 'Controlled protein:' } )
            // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
        ]);
    }

}

class ComplexInteractionForm extends InteractionForm {

    render(){
        const intn = this.state.interaction;
        const lEnt = intn.elements()[0];

        return h('div.form-interaction', [
            h(MultipleEntityForm, { entity: lEnt , type: 'Molecule list:'})
            // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
        ]);
    }
}

class LocationChangeForm extends InteractionForm{

    render(){
        const intn = this.state.interaction;
        const lEnt = intn.elements()[0];
        const rEnt = intn.elements()[1];
        const oldLocEnt = intn.elements()[2];
        const newLocEnt = intn.elements()[3];

        return h('div.form-interaction', [
            h(EntityForm, { entity: lEnt , type: 'Controller protein:'}),
            h('span', [
                h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
                    h('option', { value: 'activates' }, 'activates'),
                    h('option', { value: 'inhibits' }, 'inhibits'),
                ])
            ]),
            //TODO: will be separately added as ID and type
            h(EntityForm, { entity: rEnt , type: 'Molecule list:'}),
            h(EntityForm, { entity: oldLocEnt, type: 'Old location:' } ),
            h(EntityForm, { entity: newLocEnt, type: 'New location:' } )
            // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
        ]);
    }
}

class BiochemicalReactionForm extends InteractionForm{

    render(){
        const intn = this.state.interaction;
        const inputSmallMolecules = intn.elements()[0];
        const catalyzer = intn.elements()[1];
        const outputSmallMolecules = intn.elements()[2];

        // return h('div', 'a');
        return h('div.form-interaction', [
            h(MultipleEntityForm, { entity: inputSmallMolecules , type: 'Input small molecules:'}),
            h(EntityForm, { entity: catalyzer , type: 'Catalyzer:'}),
            h(MultipleEntityForm, { entity: outputSmallMolecules , type: 'Output small molecules:'})

            // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
        ]);
    }
}

class PhysicalInteractionForm extends InteractionForm{

    render(){
            const intn = this.state.interaction;
            const lEnt = intn.elements()[0];
            const rEnt = intn.elements()[1];

            return h('div.form-interaction', [
                h(MultipleEntityForm, { entity: lEnt , type: 'Molecule list:'}),
                h('h3.form-entity-title', 'interacts with'),
                h(MultipleEntityForm, { entity: rEnt, type: 'Entity list:' } )
                // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
            ]);
    }

}

class ActivationInhibitionForm extends InteractionForm{

    render(){
        const intn = this.state.interaction;
        const lEnt = intn.elements()[0];
        const rEnt = intn.elements()[1];

        return h('div.form-interaction', [
            h(EntityForm, { entity: lEnt , type: 'Source protein:'}),
            h('span', [
                h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
                    h('option', { value: 'activates' }, 'activates'),
                    h('option', { value: 'inhibits' }, 'inhibits'),
                ])
            ]),
            h(EntityForm, { entity: rEnt, type: 'Target protein:' } )
            // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
        ]);

    }
}


class ExpressionRegulationForm extends InteractionForm {

    render(){
            const intn = this.state.interaction;
            const lEnt = intn.elements()[0];
            const rEnt = intn.elements()[1];

            return h('div.form-interaction', [
                h(EntityForm, { entity: lEnt , type: 'Transcription factor:'}),
                h('span', [
                    h('select.form-options', { value: intn.description(), onChange: e => this.updateInteractionType(e.target.value) }, [
                        h('option', { value: 'activates' }, 'activates expression'),
                        h('option', { value: 'inhibits' }, 'inhibits expression'),
                    ])
                ]),
                h(EntityForm, { entity: rEnt, type: 'Target protein:' } )
                // h('button.delete-interaction', { onClick: e => this.deleteInteraction() }, 'X')
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
  deleteElement(el){
      let doc = this.data.document;
      Promise.try( () => doc.remove(el) );
  }

  deleteInteractionRow(intn) {
      let doc = this.data.document;

      let els = intn.elements();
      let elsLength = els.length;


      for(let i = 0; i < elsLength; i++)
          intn.removeParticipant(els[i]);

      doc.remove(intn);
      this.forceUpdate();
  }

  addInteractionRow(data){
      let self = this;
      let entArr = [];

      for(let i = 0; i < data.entityCnt; i++)
          entArr.push(self.addElement());
      entArr.push(this.addInteraction(data));

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
      const doc = this.state.document;
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

      const hArr = [];

      forms.forEach(function(form){
          let formContent = doc.interactions(form.type).map(interaction => {
              console.log(interaction.elements());
            return h('div', [h('button.delete-interaction', {onClick: e => self.deleteInteractionRow(interaction) }, 'X'), h(form.clazz, {interaction})]);
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
