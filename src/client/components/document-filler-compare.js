const React = require('react');
const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const ReactDom = require('react-dom');

const anime = require('animejs');
const Promise = require('bluebird');
const _ = require('lodash');

const { makeClassList } = require('../../util');

const Linkout = require('./document-linkout');


class DocumentFillerCompare extends React.Component {
  constructor( props ){
    super( props );

    this.state = {
      submitting: false,
      reachResponse: null,
      reachQuery: ''
    };
  }

  reset(){
    this.setState({
      submitting: false,
      documentJson: null
    });
  }

  getReachResponse(){
    let text = this.state.reachQuery;

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

  extractReachResponseInfo(){
    let reachRes = this.state.reachResponse;
    if( reachRes == null ){ return null; }

    let entFrames = _.get( reachRes, ['entities', 'frames'], []).map( frame => frame.text );

    return { entities: entFrames, interactions: [] };
  }

  render(){
    let reachResponse = this.extractReachResponseInfo();
    let formattedReachResponse = reachResponse ? h('div', [
      h('div', 'Entities'),
      h('div', reachResponse.entities.map( entity => h('div', entity) )),
      h('div', 'Interactions'),
      h('div', reachResponse.interactions.map( interaction => h('div', interaction) ))
    ]) : null;

    let rootChildren = [
      h('label.document-filler-text-label', 'Input for REACH'),
      h('textarea.document-filler-text', {
        value: this.state.reachQuery,
        onChange: e => this.setState({reachQuery: e.target.value})
      }),
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
      formattedReachResponse
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
