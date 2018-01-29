const React = require('react');
const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const Linkout = require('./document-linkout');
const Promise = require('bluebird');
const ReactDom = require('react-dom');
const { makeClassList } = require('../../util');
const anime = require('animejs');

class DocumentFillerCompare extends React.Component {
  constructor( props ){
    super( props );

    this.state = {
      submitting: false,
      reachResponse: null
    };
  }

  reset(){
    this.setState({
      submitting: false,
      documentJson: null
    });
  }

  getReachResponse(){
    let text = ReactDom.findDOMNode(this).querySelector('.document-filler-text').value;

    let makeRequest = () => fetch('/api/document/compare', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ text })
    });

    let toJson = res => res.json();

    let updateState = res => this.setState({
      reachResponse: res
    });
    Promise.try( makeRequest ).then( toJson ).then( updateState );
  }

  render(){
    let reachResponse = this.state.reachResponse ? h('pre.document-filler-output', JSON.stringify(this.state.reachResponse, null, 2)) : null;
    let rootChildren = [
      h('label.document-filler-text-label', 'Input for REACH'),
      h('textarea.document-filler-text'),
      h('div.document-filler-submit-line', [
        h('button.document-filler-submit', {
          onClick: () => this.getReachResponse()
        }, 'Submit to REACH'),
        h('span.icon.icon-spinner.document-filler-submit-spinner', {
          className: makeClassList({
            'document-filler-spinner-submitting': this.state.submitting
          })
        })
      ]),
      h('label.document-filler-text-label', 'Output from REACH'),
      reachResponse
    ];

    let documentJson = this.state.documentJson;

    if( documentJson != null ){
      rootChildren.push( h('div.document-filler-arrow', [
        h('i.material-icons', 'arrow_downward')
      ]) );

      rootChildren.push( h('div.document-filler-linkout', [
        h(Linkout, { documentJson })
      ]) );

      rootChildren.push( h('div.document-filler-open', [
        h(Link, { target: '_blank', to: documentJson.privateUrl }, [
          h('i.material-icons', 'open_in_new')
        ])
      ]) );
    }

    let root = h('div.document-filler', rootChildren);

    return root;
  }
}

module.exports = DocumentFillerCompare;
