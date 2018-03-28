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
      history: [],
      todos: []
    };
  }

  componentDidMount(){
    const docEvents = ['remove', 'add', 'rename', 'toggleorganism'];

    const elementEvents = [
      'rename',
      // 'reposition', // We dont really need to log reposition events
      'redescribe'
    ];

    const entityEvents = [
      'modify',
      'associated',
      // 'associate', // redundant event
      'unassociated',
      // 'unassociate',  // redundant event
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

    let logInteractionEvts = intn => {
      interactionEvents.forEach(evt => {
        intn.on(evt, e => {
          const intnName = intn.name() === '' ? `unamed` : intn.name();

          pushHistory(`${evt} event for ${intnName} interaction`);
        });
      });
    };

    let logEntityEvts = ent => {
      entityEvents.forEach(evt => {
        ent.on(evt, e => {
          const entName = ent.name() === '' ? `unamed` : ent.name();

          pushHistory(`${evt} event for ${entName} entity`);
        });
      });
    };

    let logElementEvts = el => {
      elementEvents.forEach(evt => {
        el.on(evt, (e) => {
          const elName = el.name() === '' ? `unamed ${el.type()}` : el.name();

          pushHistory(`${evt} event for element ${elName}`);
        });
      });

      if (el.isInteraction()) {
        logInteractionEvts(el);
      } else {
        logEntityEvts(el);
      }
    };

    docEvents.forEach(evt => {
      this.data.document.on(evt, e => {
        const entityName = e.name() === '' ? 'unamed entity' : e.name();

        pushHistory(`${evt} event for ${entityName}`);

        if (evt === 'add') {
          logElementEvts(e);
          this.setState({
            todos: this.state.todos.concat(['ground unnamed entity'])
          });
        }
      });
    });

    this.data.document.elements().forEach(logElementEvts);
    this.setState({
      todos: this.state.todos.concat(this.data.document.entities().filter(ent => !ent.associated()).map(ent => {
        return `ground ${ent.name() ? ent.name() : 'unnamed entity'}`;
      }))
    });
  }

  render() {
    const history = this.state.history.map(entry => {
      return h('div', entry);
    });

    const todos = this.state.todos.map(todo => {
      return h('div', todo);
    });

    return h('div.action-logger', [
      h('div', 'ACTION HISTORY'),
      ...history,
      h('div', 'TODOS'),
      ...todos
    ]);
  }
}

module.exports = ActionLogger;