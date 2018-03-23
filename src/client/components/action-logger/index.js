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
    const docEvents = ['remove', 'add'];

    docEvents.forEach(evt => {
      this.data.document.on(evt, e => {
        const entityName = e.name() === '' ? 'unamed' : e.name();
        console.log(evt, entityName);
        this.setState({
          history: this.state.history.concat(`${evt} event for ${entityName} entity`)
        });
      });
    });
  }

  render() {
    const history = this.state.history.map(entry => {
      return h('div', entry);
    });
    console.log(history);

    return h('div.action-logger', history);
  }
}

module.exports = ActionLogger;