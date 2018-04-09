const h = require('react-hyperscript');

const DirtyComponent = require('../dirty-component');


class ActionLogger extends DirtyComponent {
  constructor(props){
    super(props);


    this.data = {
      bus: props.bus,
      document: props.document,
      intnEvents: [],
      entEvents: [],
      elEvents: []
    };

    this.state = {
      history: [],
      todos: [],
      open: true
    };
  }

  shouldComponentUpdate(next, prev) {
    return true;
  }

  componentDidMount(){
    this.onToggleTimeline = () => {
      this.setState({open: !this.state.open});
    };

    this.data.bus.on('toggletimeline', this.onToggleTimeline);

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

        let intnEvent = () => {
          const intnName = intn.name() === '' ? `unamed` : intn.name();

          pushHistory(`${evt} event for ${intnName} interaction`);

          this.dirty();
        };

        intn.on(evt, intnEvent);
        this.data.intnEvents.push(intnEvent);
      });
    };

    let logEntityEvts = ent => {
      entityEvents.forEach(evt => {
        let entEvent = e => {
          const entName = ent.name() === '' ? `unamed` : ent.name();

          pushHistory(`${evt} event for ${entName} entity`);

          this.dirty();
        };

        ent.on(evt, entEvent);
        this.data.entEvents.push(entEvent);
      });
    };

    let logElementEvts = el => {
      elementEvents.forEach(evt => {
        let elEvent = e => {
          const elName = el.name() === '' ? `unamed ${el.type()}` : el.name();

          pushHistory(`${evt} event for ${elName}`);

          this.dirty();
        };
        el.on(evt, elEvent);
        this.data.elEvents.push(elEvent);
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
    this.data.bus.removeListener(this.onToggleTimeline);
    this.data.document.removeListener(this.onAdd);
    this.data.document.removeListener(this.onRemove);

    this.data.intnEvents.forEach(evt => this.data.document.removeListener(evt));
    this.data.entEvents.forEach(evt => this.data.document.removeListener(evt));
    this.data.elEvents.forEach(evt => this.data.document.removeListener(evt));
  }

  render() {
    const history = this.state.history.slice(Math.max(this.state.history.length - 3, 1)).map(entry => {
      return h('li', entry);
    });

    const todos = this.data.document.entities().filter(ent => !ent.associated()).map(ent => {
      return h('li', `ground ${ent.name() ? ent.name() : 'unnamed entity'}`);
    });

    let content;
    if (this.state.open) {
      content = h('div.action-logger', [
        h('div.close-menu', { onClick: () => this.setState({open: !this.state.open}) }, '--'),
        h('div.action-section', [
          h('div.action-logger-title', 'ACTION HISTORY'),
          h('ul', history)
        ]),
        h('div.action-section', [
          h('div.action-logger-title', 'TODO'),
          h('ul', todos)
        ]),
        h('div.action-section', [
          h('div.action-logger-title', 'GUIDE'),
          h('ul', [
            h('li', 'click + to create a new entity'),
            h('li', 'click -> to create an interaction between two entities'),
            h('li', 'WIP (click the submit button to finish editing your Factoid)'),
          ])
        ])
      ]);
    } else {
      content = h('div.action-logger-minimized', [
        h('div.minimized-timeline', [
          h('div', 'GUIDE'),
          h('div', { onClick: () => this.setState({open: !this.state.open }) },  '+')
        ])
      ]);
    }

    return content;
  }
}

module.exports = ActionLogger;