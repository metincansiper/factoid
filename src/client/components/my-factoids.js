const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const { Component } = require('react');
const FileSaver = require('file-saver');


class MyFactoids extends Component {
  constructor(props){
    super(props);

    this.state = {
      factoidsLoaded: false,
      factoids: []
    };

    fetch('/api/document/my-factoids').then(res => res.json()).then(factoids => this.setState({
      factoids: factoids,
      factoidsLoaded: true
    }));
  }

  render(){

    let getFactoidEntry = factoid => {
      return h('li.factoid-entry', [
        h(Link, {
          className: 'plain-link',
          to: `/document/${factoid.id}/${factoid.secret}`
        },
        getFactoidName(factoid))
      ]);
    };

    let getFactoidName = (factoid) => {
      return factoid.name === '' ? 'Untitled document' : factoid.name;
    };

    let getFactoidExportToBiopax = factoid => {
        return h('li.factoid-export-to-biopax', [
          h(Link, {
            className: 'plain-link',
            to: '#',
            onClick: () => {
              fetch(`/api/document/convert-to-biopax/${factoid.id}`).then( res => res.text() ).then( content => {
                exportToFile(`${getFactoidName(factoid)}.owl`, content);
              } );
            }
          },
          'Export to Biopax')
        ]);
    };

    let exportToFile = ( fileName, content ) => {
      var file = new File([content], fileName, {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(file);
    };

    let getFactoidLine = factoid => {
      return h('ul.factoid-line', [
        getFactoidEntry(factoid),
        getFactoidExportToBiopax(factoid)
      ]);
    }

    let factoids = this.state.factoids.map(factoid => {
      return getFactoidLine(factoid);
    });

    let content = this.state.factoidsLoaded ? h('div.factoid-list', [
      h('div', [
        h('h2.my-factoids-title', 'My Factoids'),
        h('list.factoid-line-container', [
          ...factoids
        ])
      ])
    ]) : h('div', 'loading');

    return h('div.my-factoids', [
      content
    ]);
  }
}

module.exports = MyFactoids;
