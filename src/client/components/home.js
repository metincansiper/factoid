import _ from 'lodash';
import h from 'react-hyperscript';
import { Component } from 'react';
import Popover from './popover/popover';
import { makeClassList, tryPromise } from '../../util';
import EventEmitter from 'eventemitter3';
import { truncateString } from '../../util';

import { EMAIL_CONTEXT_SIGNUP, TWITTER_ACCOUNT_NAME, EMAIL_CONTEXT_JOURNAL, DOI_LINK_BASE_URL } from '../../config';

const checkStatus = response => {
  if ( response.status >= 200 && response.status < 300 ) {
    return response;
  } else {
    var error = new Error( response.statusText );
    error.response = response;
    throw error;
  }
};

class RequestForm extends Component {
  constructor(props){
    super(props);

    this.bus = this.props.bus;

    this.state = {
      paperId: '',
      authorEmail: '',
      context: this.props.context || EMAIL_CONTEXT_SIGNUP,
      submitting: false,
      done: false,
      docJSON: undefined,
      errors: {
        incompleteForm: false,
        network: false
      }
    };

    this.onCloseCTA = () => this.reset();
  }

  reset(){
    this.setState({
      paperId: '',
      authorEmail: '',
      submitting: false,
      done: false,
      docJSON: undefined,
      errors: {
        incompleteForm: false,
        network: false
      }
    });
  }

  componentDidMount(){
    this.bus.on('closecta', this.onCloseCTA);
  }

  componentWillUnmount(){
    this.bus.removeListener('closecta', this.onCloseCTA);
  }

  updateForm(fields){
    this.setState(fields);
  }

  handleContextChange(e){
    this.setState({ context: e.target.value });
  }

  submitRequest(){
    const { paperId, authorEmail, context } = this.state;
    const { apiKey } = this.props;

    if( !paperId || !authorEmail ){
      this.setState({ errors: { incompleteForm: true } });

    } else {
      const url = 'api/document';
      const data = _.assign( {}, {
        paperId: _.trim( paperId ),
        authorEmail,
        context,
        apiKey
      });
      const fetchOpts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( data )
      };

      this.setState({ submitting: true, errors: { incompleteForm: false, network: false } });
      fetch( url, fetchOpts )
        .then( checkStatus )
        .then( response => response.json() )
        .then( docJSON => new Promise( resolve => this.setState({ done: true, docJSON }, resolve ) ) )
        .catch( () => new Promise( resolve => this.setState({ errors: { network: true } }, resolve ) ) )
        .finally( () => new Promise( resolve => this.setState({ submitting: false }, resolve ) ) );
    }
  }

  render(){
    const { done, docJSON } = this.state;
    if( done && docJSON ){
      const { privateUrl, citation: { doi, title, reference } } = docJSON;
      const articleString = _.compact([ truncateString( title ), reference ]).join(' ');

      return h('div.home-request-form-container', [
        h('div.home-request-form-done', [
          h( 'a.home-request-form-done-button', { href: privateUrl, target: '_blank', }, 'START BIOFACTOID' ),
          h( 'div.home-request-form-done-body', [
            h( doi ? 'a.plain-link': 'span', (doi ? { href: `${DOI_LINK_BASE_URL}${doi}`, target: '_blank'}: {}), `Article: ${articleString}` )
          ]),
          h( 'div.home-request-form-done-footer', 'An email invitation has also been sent.' )
        ])
      ]);
    }

    const contextSelector = contexts => {
      let radios = [];
      let addType = (typeVal, displayName) => {
        radios.push(
          h('input', {
            type: 'radio',
            name: `home-request-form-context-${typeVal}`,
            id: `home-request-form-radio-context-${typeVal}`,
            value: typeVal,
            checked: this.state.context === typeVal,
            onChange: e => this.handleContextChange(e)
          }),
          h('label', {
            htmlFor: `home-request-form-radio-context-${EMAIL_CONTEXT_SIGNUP}`
          }, displayName)
        );
      };
      contexts.forEach( context => addType( context, _.capitalize( context ) ) );
      return h( 'div.radioset.home-request-form-radioset', radios );
    };

    return h('div.home-request-form-container', [
      h('div.home-request-form-description', 'Claim your article'),
      h('i.icon.icon-spinner.home-request-spinner', {
        className: makeClassList({ 'home-request-spinner-shown': this.state.submitting })
      }),
      h('div.home-request-form', {
        className: makeClassList({ 'home-request-form-submitting': this.state.submitting })
      }, [
        h('input', {
          type: 'text',
          placeholder: 'Article title',
          onChange: e => this.updateForm({ paperId: e.target.value }),
          value: this.state.paperId
        }),
        h('input', {
          type: 'text',
          placeholder: 'Email address',
          onChange: e => this.updateForm({
            authorEmail: e.target.value
          }),
          value: this.state.authorEmail
        }),
        this.props.apiKey ? contextSelector([ EMAIL_CONTEXT_SIGNUP, EMAIL_CONTEXT_JOURNAL ]) : null,
        h('div.home-request-error', {
          className: makeClassList({ 'home-request-error-message-shown': this.state.errors.incompleteForm })
        }, 'Fill out everything above, then try again.'),
        h('div.home-request-error', {
          className: makeClassList({ 'home-request-error-message-shown': this.state.errors.network })
        }, 'Please try again later'),
        h('button.salient-button.home-request-submit', {
          onClick: () => this.submitRequest()
        }, 'Request an invitation')
      ])
    ]);
  }
}

// N.b. scroller lists any doc in debug mode
class Scroller extends Component {
  constructor(props){
    super(props);

    this.state = {
      pagerLeftAvailable: false,
      pagerRightAvailable: false,
      docs: []
    };

    this.onScrollExplore = _.debounce(() => {
      this.updatePagerAvailability();
    }, 40);
  }

  componentDidMount(){
    this.refreshDocs().then(() => this.onScrollExplore());
  }

  scrollExplore(factor = 1){
    if( this.exploreDocsContainer ){
      const container = this.exploreDocsContainer;
      const padding = parseInt(getComputedStyle(container)['padding-left']);
      const width = container.clientWidth - 2*padding;

      this.exploreDocsContainer.scrollBy({
        left: width * factor,
        behavior: 'smooth'
      });
    }
  }

  scrollExploreLeft(){
    this.scrollExplore(-1);
  }

  scrollExploreRight(){
    this.scrollExplore(1);
  }

  updatePagerAvailability(){
    if( this.exploreDocsContainer ){
      const haveNoDocs = this.state.docs.length === 0;
      const { scrollLeft, scrollWidth, clientWidth } = this.exploreDocsContainer;
      const allTheWayLeft = scrollLeft === 0;
      const allTheWayRight = scrollLeft + clientWidth >= scrollWidth;
      let leftAvail = !allTheWayLeft && !haveNoDocs;
      let rightAvail = !allTheWayRight && !haveNoDocs;

      this.setState({
        pagerLeftAvailable: leftAvail,
        pagerRightAvailable: rightAvail
      });
    }
  }

  refreshDocs(){
    const url = `/api/document`;

    const toJson = res => res.json();
    const update = docs => new Promise(resolve => this.setState({ docs }, () => resolve(docs)));
    const doFetch = () => fetch(url);

    return tryPromise(doFetch).then(toJson).then(update);
  }

  render(){
    const exploreDocEntry = doc => {
      const { title, authors: { authorList }, reference: journalName } = doc.citation;
      let authorNames = authorList.map( a => a.name );
      const id = doc.id;
      const link = doc.publicUrl;

      if( authorNames.length > 3 ){
        authorNames = authorNames.slice(0, 3).concat([ '...', authorNames[authorNames.length - 1] ]);
      }

      return h('div.scroller-doc', {
      }, [
        h('a', {
          href: link,
          target: '_blank',
          onTouchStart: e => e.preventDefault()
        }, [
          h('div.scroller-doc-descr', [
            h('div.scroller-doc-title', title),
            h('div.scroller-doc-authors', authorNames.map((name, i) => h(`span.scroller-doc-author.scroller-doc-author-${i}`, name))),
            h('div.scroller-doc-journal', journalName)
          ]),
          h('div.scroller-doc-figure', {
            style: {
              backgroundImage: `url('/api/document/${id}.png')`
            }
          }),
          h('div.scroller-doc-journal-banner')
        ])
      ]);
    };

    const docPlaceholders = () => {
      const numPlaceholders = 20;
      const placeholders = [];

      for( let i = 0; i < numPlaceholders; i++ ){
        const p = h('div.scroller-doc.scroller-doc-placeholder');

        placeholders.push(p);
      }

      return placeholders;
    };

    const isPublished = doc => doc.status.toLowerCase() === 'published';
    const docs = this.state.docs.filter(isPublished);

    return h('div.scroller', [
      h('div.scroller-pager.scroller-pager-left', {
        className: makeClassList({
          'scroller-pager-available': this.state.pagerLeftAvailable
        }),
        onClick: () => this.scrollExploreLeft()
      }, [
        h('i.scroller-pager-icon.material-icons', 'chevron_left')
      ]),
      h('div.scroller-pager.scroller-pager-right', {
        className: makeClassList({
          'scroller-pager-available': this.state.pagerRightAvailable
        }),
        onClick: () => this.scrollExploreRight()
      }, [
        h('i.scroller-pager-icon.material-icons', 'chevron_right')
      ]),
      h('div.scroller-content', {
        className: makeClassList({
          'scroller-content-only-placeholders': docs.length === 0
        }),
        onScroll: () => this.onScrollExplore(),
        ref: el => this.exploreDocsContainer = el
      }, (docs.length > 0 ? docs.map(exploreDocEntry) : docPlaceholders()).concat([
        h('div.scroller-doc-spacer')
      ]))
    ]);
  }
}

class Home extends Component {
  constructor(props){
    super(props);

    this.bus = new EventEmitter();
  }

  componentDidMount(){
    document.title = 'Biofactoid';
  }

  render(){
    const CTA = () => {
      return h(Popover, {
        tippy: {
          html: h(RequestForm, {
            bus: this.bus,
            doneMsg: 'Thank you for your request!  We will contact you soon with next steps.'
          }),
          onHidden: () => this.bus.emit('closecta'),
          placement: 'top'
        }
      }, [
        h('button.home-cta-button.salient-button', 'Get started')
      ]);
    };

    return h('div.home', [
      h('div..home-section.home-figure-section.home-banner', [
        h('div.home-figure.home-figure-0'),
        h('div.home-figure.home-figure-banner-bg'),
        h('div.home-caption.home-banner-caption', [
          h('div.home-banner-logo', [
            h('h1.home-banner-title', 'Biofactoid')
          ]),
          h('div.home-banner-tagline', 'Explore the biological pathway in an article, shared by the author')
        ]),
        h('div.home-explore#home-explore', [
          h('h2', 'Recently shared articles'),
          h(Scroller)
        ])
      ]),
      h('div.home-section.home-figure-section', [
        h('div.home-figure.home-figure-1'),
        h('div.home-caption', [
          h('p', [
            `Compose your pathway by adding the key interactions`, h('sup', '*'), ` you researched.  `,
            `Share so everyone else can explore it and link to your article.`
          ]),
          h('p', `Our mission is to integrate published pathway knowledge and make it freely available to researchers.`),
          h('p.home-figure-footnote', [
            h('sup', '*'),
            `Add interactions such as binding, post-translational modification, and transcription.  Add chemicals or genes from human, mouse, rat, S. cervisiae, D. melanogaster, E. coli, C. elegans, D. rerio, and A. thaliana.`
          ])
        ]),
        h('div.home-cta', [
          h(CTA)
        ]),

        h('div.home-figure-footer', [
          h('div.home-nav', [
            h('a.home-nav-link', [
              h(Popover, {
                tippy: {
                  html: h('div.home-contact-info', [
                    h('p', [
                      'Biofactoid is freely brought to you in collaboration with ',
                      h('a.plain-link', { href: 'https://baderlab.org' }, 'Bader Lab at the University of Toronto'),
                      ', ',
                      h('a.plain-link', { href: 'http://sanderlab.org' }, 'Sander Lab at Harvard'),
                      ', and the ',
                      h('a.plain-link', { href: 'https://www.ohsu.edu/people/emek-demir/AFE06DC89ED9AAF1634F77D11CCA24C3' }, 'Pathway and Omics Lab at the University of Oregon'),
                      '.'
                    ]),
                    h('p', [
                      `Contact us at `,
                      h('a.plain-link', { href: 'mailto:info@biofactoid.org' }, 'info@biofactoid.org'),
                      `.`
                    ])
                  ])
                }
              }, [
                'Contact'
              ])
            ]),
            h('a.home-nav-link', { href: `https://twitter.com/${TWITTER_ACCOUNT_NAME}` }, 'Twitter'),
            h('a.home-nav-link', { href: 'https://github.com/PathwayCommons/factoid' }, 'GitHub')
          ]),
          h('div.home-credit-logos', [
            h('i.home-credit-logo'),
          ])
        ])
      ])
    ]);
  }
}

export { Home as default, RequestForm };
