const h = require('react-hyperscript');

const DirtyComponent = require('../dirty-component');


class ActionLogger extends DirtyComponent {
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

  shouldComponentUpdate(next, prev) {
    return true;
  }

  componentDidMount(){

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

          this.dirty();
        });
      });
    };

    let logEntityEvts = ent => {
      entityEvents.forEach(evt => {
        ent.on(evt, e => {
          const entName = ent.name() === '' ? `unamed` : ent.name();

          pushHistory(`${evt} event for ${entName} entity`);

          this.dirty();
        });
      });
    };

    let logElementEvts = el => {
      elementEvents.forEach(evt => {
        el.on(evt, (e) => {
          const elName = el.name() === '' ? `unamed ${el.type()}` : el.name();

          pushHistory(`${evt} event for ${elName}`);

          this.dirty();
        });
      });

      if (el.isInteraction()) {
        logInteractionEvts(el);
      } else {
        logEntityEvts(el);
      }
    };

    this.onAdd = e => {
      const elName = e.name() === '' ? 'unamed element' : e.name();

      pushHistory(`add event for ${elName}`);

      logElementEvts(e);

      this.dirty();
    };

    this.onRemove = e => {
      const elName = e.name() === '' ? 'unamed entity' : e.name();

      pushHistory(`remove event for ${elName}`);

      this.dirty();
    };

    this.data.document.on('add', this.onAdd);

    this.data.document.on('remove', this.onRemove);

    this.data.document.elements().forEach(logElementEvts);
    this.setState({
      todos: this.state.todos.concat(this.data.document.entities().filter(ent => !ent.associated()).map(ent => {
        return `ground ${ent.name() ? ent.name() : 'unnamed entity'}`;
      }))
    });
  }

  componentWillUnmount(){
    this.data.document.removeListener(this.onAdd);
    this.data.document.removeListener(this.onRemove);
  }

  render() {
    const history = this.state.history.slice(Math.max(this.state.history.length - 4, 1)).map(entry => {
      return h('div', entry);
    });

    const todos = this.data.document.entities().filter(ent => !ent.associated()).map(ent => {
      return h('li', `ground ${ent.name() ? ent.name() : 'unnamed entity'}`);
    });

    return h('div.action-logger', [
      h('div', 'ACTION HISTORY'),
      ...history,
      h('div', 'TODO'),
      h('ul', todos),
      h('div', 'WHAT CAN YOU DO'),
      h('ul', [
        h('li', 'click + to create a new entity'),
        h('li', 'click -> to create an interaction between two entities'),
        h('li', 'WIP (click the submit button to finish editing your Factoid)'),
      ])
    ]);
  }
}

module.exports = ActionLogger;