import DataComponent from '../data-component';
import h from 'react-hyperscript';
import ReactDom from 'react-dom';
import { initCache, error } from '../../../util';
import _ from 'lodash';
import * as defs from '../../defs';
import { animateDomForEdit } from '../animate';
import uuid from 'uuid';
import Progression from './progression';
import EventEmitter from 'eventemitter3';
import { INTERACTION_TYPES, INTERACTION_TYPE } from '../../../model/element/interaction-type';
import { tryPromise, makeCancelable } from '../../../util';
import assocDisp from './entity-assoc-display';

let stageCache = new WeakMap();
let associationCache = new WeakMap();

class InteractionInfo extends DataComponent {
  constructor( props ){
    super( props );

    this.debouncedRedescribe = _.debounce( descr => {
      this.props.element.redescribe( descr );
    }, defs.updateDelay );

    let p = this.props;
    let el = p.element;

    let progression = new Progression({
      STAGES: ['PARTICIPANT_TYPES', 'ASSOCIATE', 'COMPLETED'],
      getStage: () => this.getStage(),
      canGoToStage: stage => this.canGoToStage(stage),
      goToStage: stage => this.goToStage(stage)
    });

    let { STAGES, ORDERED_STAGES } = progression;
    let initialStage = ORDERED_STAGES[1]; // skip the arrow / ppt types stage b/c the user drew the edge with the arrow already

    let stage = initCache( stageCache, el, el.completed() ? STAGES.COMPLETED : initialStage );
    let assoc = initCache( associationCache, el, { matches: [], offset: 0 } );

    this.data = {
      el,
      stage,
      description: p.element.description(),
      progression,
      bus: p.bus || new EventEmitter(),
      limit: defs.associationSearchLimit,
      matches: assoc.matches,
      offset: assoc.offset
    };
  }

  getStage(){
    return this.data.stage;
  }

  canGoToStage( stage ){
    let { el, progression } = this.data;
    let { STAGES } = progression;

    switch( stage ){
      case STAGES.PARTICIPANT_TYPES:
        return false; // disable this phase for now, maybe delete all related code eventually
      case STAGES.ASSOCIATE:
        return true;
      case STAGES.COMPLETED:
        return el.associated();
      default:
        return false;
    }
  }

  goToStage( stage ){
    let { el, progression, bus, stage: currentStage } = this.data;
    let { STAGES } = progression;

    if( this.canGoToStage(stage) ){
      this.setData({ stage, stageError: null });

      stageCache.set( el, stage );

      switch( stage ){
        case STAGES.ASSOCIATE:
          bus.emit('closepptstip', el);
          break;

        case STAGES.PARTICIPANT_TYPES:
          bus.emit('openpptstip', el);
          break;

        case STAGES.COMPLETED:
          bus.emit('closepptstip', el);
          this.complete();
          break;

        default:
          throw error(`No such stage: ${stage}`);
      }
    } else {
      let stageError;

      switch( currentStage ){
        case STAGES.ASSOCIATE:
          stageError = `Select a type before proceeding.`;
          break;
        default:
          stageError = 'This step should be completed before proceeding.';
      }

      this.setData({ stageError });
    }
  }

  animateEditByKey( domEl, key ){
    let ans = this._animations = this._animations || {};

    if( ans[key] ){
      ans[key].pause();
    }

    ans[key] = animateDomForEdit( domEl );
  }

  componentDidMount(){
    let root = ReactDom.findDOMNode( this );
    let comment = root.querySelector('.interaction-info-description');
    let { progression, bus, el, matches } = this.data;
    let { STAGES } = progression;
    let stage = progression.getStage();

    progression.goToStage( stage );

    if( matches.length === 0 && el != null ){
      this.updateMatches();
    }

    this.onRemoteRedescribe = () => {
      this.setData({ description: this.data.el.description() });

      this.animateEditByKey( comment, 'descr' );
    };

    this.onAssociate = () => {
      this.dirty();
    };

    this.onRemoteAssociate = () => {
      this.dirty( () => {
        let input = root.querySelector(`.interaction-info-assoc-radioset`);

        this.animateEditByKey( input, 'assoc' );
      } );
    };

    let goPastPptTypeStage = () => {
      if( progression.getStage() === STAGES.PARTICIPANT_TYPES ){
        progression.forward();
      }
    };

    this.onRetypePpt = () => {
      goPastPptTypeStage();
    };

    this.onRetypePptSkip = () => {
      goPastPptTypeStage();
    };

    el.on('remoteassociate', this.onRemoteAssociate);
    el.on('remoteredescribe', this.onRemoteRedescribe);
    el.on('associate', this.onAssociate);
    bus.on('retypeppt', this.onRetypePpt);
    bus.on('retypepptskip', this.onRetypePptSkip);
  }

  componentWillUnmount(){
    let { element: el, bus } = this.props;

    el.removeListener('remoteassociate', this.onRemoteAssociate);
    el.removeListener('remoteredescribe', this.onRemoteRedescribe);
    el.removeListener('associate', this.onAssociate);
    bus.removeListener('retypeppt', this.onRetypePpt);
    bus.removeListener('retypepptskip', this.onRetypePptSkip);
  }

  updateMatches( offset = this.data.offset ) {
    let { limit, el } = this.data;
    let s = this.data;

    let genes = el.participants().map( p => p.name() );

    let q = {
      genes,
      limit,
      offset: s.offset
    };

    let makeRequest = () => fetch( '/api/element-association/search-intn', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(q)
    } );

    let jsonify = res => res.json();

    let updateView = matches => {
      matches.forEach( m => s.matches.push(m) );
      this.setData({ matches: s.matches, offset: s.offset });

      // cache the matches in the element for re-creation of component
      associationCache.set( el, {
        matches: s.matches,
        offset: s.offset
      } );
    };

    return makeCancelable(
      Promise.resolve()
        .then( makeRequest )
        .then( jsonify )
        .then( updateView )
    );
  }

  getMoreMatches( numMore = this.data.limit ){
    let s = this.data;

    // if( !s.name || s.gettingMoreMatches || this._unmounted ){ return Promise.resolve(); }

    let offset = s.offset + numMore;

    // this.setData({
    //   gettingMoreMatches: true
    // });

    return this.updateMatches( offset );
  }

  redescribe( descr ){
    let p = this.props;
    let el = p.element;

    this.debouncedRedescribe( descr );

    p.bus.emit('redescribedebounce', el, descr);

    this.setData({ description: descr });
  }

  associate( assoc ){
    let p = this.props;
    let el = p.element;

    el.associate( assoc );
  }

  complete(){
    let p = this.props;
    let el = p.element;

    el.complete();
  }

  render(){
    let children = [];
    let p = this.props;
    let el = p.element;
    let s = this.data;
    let doc = p.document;
    let { progression } = s;
    let { STAGES, ORDERED_STAGES } = progression;
    let stage = progression.getStage();

    if( stage === STAGES.COMPLETED || !doc.editable() ){
      let showEditButton = doc.editable();
      let assoc = el.association();
      let summaryChildren = [];

      summaryChildren.push( h('div.interaction-info-summary-text', assoc ? assoc.toString() : [
        h('i.material-icons', 'info'),
        h('span', ' This interaction has no data associated with it.')
      ]) );

      if( showEditButton ){
        summaryChildren.push( h('div.interaction-info-edit', [
          h('button.salient-button', {
            onClick: () => progression.goToStage( ORDERED_STAGES[1] )
          }, `Select a different type than "${assoc.displayValue}"`)
        ]) );
      }

      children.push( h('div.interaction-info-summary', summaryChildren) );
    } else if( stage === STAGES.ASSOCIATE ){
      let radioName = 'interaction-info-assoc-radioset-' + el.id();
      let radiosetChildren = [];

      INTERACTION_TYPES.forEach( IntnType => {
        let radioId = 'interaction-info-assoc-radioset-item-' + uuid();
        let checked = el.associated() && el.association().value === IntnType.value;
        let indented = [
          INTERACTION_TYPE.PHOSPHORYLATION,
          INTERACTION_TYPE.DEPHOSPHORYLATION,
          INTERACTION_TYPE.METHYLATION,
          INTERACTION_TYPE.DEMETHYLATION,
          INTERACTION_TYPE.UBIQUITINATION,
          INTERACTION_TYPE.DEUBIQUITINATION
        ].some( IndentedType => IndentedType.value === IntnType.value );

        radiosetChildren.push( h('input.interaction-info-type-radio', {
          type: 'radio',
          onChange: () => {
            this.associate( IntnType );
            progression.forward();
          },
          onClick: () => { // skip to next stage when clicking existing assoc
            if( checked ){ progression.forward(); }
          },
          id: radioId,
          name: radioName,
          value: IntnType.value,
          checked
        }) );

        radiosetChildren.push( h('label.interaction-info-assoc-radio-label', {
          className: indented ? 'interaction-info-type-radio-indented' : '',
          htmlFor: radioId
        }, IntnType.displayValue) );
      } );

      let onMatchesScroll = _.debounce( div => {
        let scrollMax = div.scrollHeight;
        let scroll = div.scrollTop + div.clientHeight;

        if( scroll >= scrollMax ){
          this.getMoreMatches();
        }
      }, defs.updateDelay / 2 );

      let renderMatch = m => {
        return [
          h('div.entity-info-name', m.type),
          h('span.entity-info-section', [
            h('span', m.text)
          ])
        ];

      };


      let { matches } = s;
      let interactions = matches.map( m => {
        return h('div.entity-info-match', [
          h('div.entity-info-match-target', {
            onClick: () => { // skip to next stage when clicking existing assoc
              progression.forward();
            }
          }, renderMatch( m ) ),
          assocDisp.link( { id: m.pmid, namespace: 'intn' } )
        ])
      } );

      let container = h('div.entity-info-matches', {
        // className: s.replacingMatches ? 'entity-info-matches-replacing' : '',
        onScroll: evt => {
          onMatchesScroll( evt.target );

          evt.stopPropagation();
        }
      }, interactions);
      //
      // Promise.resolve().then( makeRequest ).then( jsonify ).then( matches => {
      //   this.setData({ matches });
      // } );

      children.push(container);
    }

    return h('div.interaction-info', children);
  }
}

export default props => h(InteractionInfo, Object.assign({ key: props.element.id() }, props));
