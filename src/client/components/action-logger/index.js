const React = require('react');
const h = require('react-hyperscript');


class ActionLogger extends React.Component {
  constructor(props){
    super(props);


    this.data = {
      bus: props.bus,
      document: props.document
    };

    this.state = {
      history: []
    };
  }

  componentDidMount(){
    const docEvents = ['remove', 'add', 'rename', 'toggleorganism'];

    const elementEvents = [
      'rename',
      'reposition',
      'redescribe'
    ];

    const entityEvents = [
      'modify',
      'associated',
      'associate',
      'unassociated',
      'unassociate',
      'complete',
      'uncomplete'
    ];
    const interactionEvents = [
      'retype'
    ];

    let pushHistory = (histItem) => {
      this.setState({
        history: this.state.history.concat(histItem)
      });
    };

    docEvents.forEach(evt => {
      this.data.document.on(evt, e => {
        const entityName = e.name() === '' ? 'unamed entity' : e.name();

        pushHistory(`${evt} event for ${entityName}`);
      });
    });

    this.data.document.elements().forEach(element => {
      elementEvents.forEach(evt => {
        element.on(evt, (e) => {
          const elName = element.name() === '' ? `unamed ${element.type()}` : element.name();

          pushHistory(`${evt} event for element ${elName}`);
        });
      });
    });

    this.data.document.entities().forEach(entity => {
      entityEvents.forEach(evt => {
        entity.on(evt, e => {
          const entName = entity.name() === '' ? `unamed` : entity.name();

          pushHistory(`${evt} event for ${entName} entity`);
        });
      });
    });

    this.data.document.interactions().forEach(interaction => {
      interactionEvents.forEach(evt => {
        interaction.on(evt, e => {
          const intnName = interaction.name() === '' ? `unamed` : interaction.name();

          pushHistory(`${evt} event for ${intnName} interaction`);
        });
      });
    });
  }

  render() {
    const history = this.state.history.map(entry => {
      return h('div', entry);
    });

    return h('div.action-logger', history);
  }
}

module.exports = ActionLogger;