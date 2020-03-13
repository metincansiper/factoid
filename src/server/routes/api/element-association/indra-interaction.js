import fetch from 'node-fetch';

import { INDRA_RELATIONS_URL, INDRA_STATEMENTS_URL } from '../../../../config';
import logger from '../../../logger';
import { tryPromise, memoize } from '../../../../util';
import querystring from 'querystring';
import LRUCache from 'lru-cache';
import _ from 'lodash';

const QUERY_CACHE_SIZE = 1000;
const QUERY_CHUNK_SIZE = 50;

const getInteractions = (agent0, agent1) => {
  return (
    tryPromise( () => getRelations(agent0, agent1) )
      .then( rels => {
        let hashes = _.flatten( rels.map( rel => Object.keys(rel.hashes) ) );
        let hashChunks = _.chunk( hashes, QUERY_CHUNK_SIZE );

        let i = 0;
        let interactions = [];

        let processNextChunk = () => {
          if ( i == hashChunks.length ) {
            return Promise.resolve(interactions);
          }

          let chunk = hashChunks[ i ];
          i++;

          let promises = chunk.map( hash => getStatement( hash ) );

          return Promise.all( promises )
            .then( statements => statements.filter( s => s != null ) )
            .then( statements => statements.map( statementToInteraction ) )
            .then( intns => interactions.push( ...intns ) )
            .then( processNextChunk );
        };

        return processNextChunk();
      } )
  );
};

const statementToInteraction = stmt => {
  let { english, type, evidence } = stmt;
  let pmid = _.get(evidence, [0, 'text_refs', 'PMID']);

  return {pmid, text: sanitizeEnglish(english), type};
};

const sanitizeEnglish = english => {
  if ( _.isNil(english) ) {
    return '';
  }

  let index = 0

  while ( true ) {
    let openerIndex = english.indexOf('<');
    let closerIndex = english.indexOf('>');
    if ( openerIndex < 0 || closerIndex < 0 || openerIndex > closerIndex ) {
      return english;
    }


    english = english.substr(0, openerIndex) + english.substr(closerIndex + 1);
  }
};

const getRelations = (agent0, agent1) => {
  // let query = { agent0, agent1, limit: 100 };
  let query = { agent0, agent1 };
  let addr = INDRA_RELATIONS_URL + '?' + querystring.stringify( query );
  return (
    tryPromise( () => fetch( addr ) )
      .then( res => res.json() )
      .then( res => res.relations )
  );
};

const getStatement = hash => {
  let query = { with_english: 'true', format: 'json-js' };
  let addr = INDRA_STATEMENTS_URL + hash + '?' + querystring.stringify( query );
  return (
    tryPromise( () => fetch( addr ) )
      .then( res => res.json() )
      .then( res => {
        let statements = res.statements;
        if ( _.isNil( statements ) ) {
          return null;
        }

        let stmt =  Object.values( statements )[0];
        return stmt;
      } )
  );
};

const searchAll = memoize( (agent0, agent1) => getInteractions( agent0, agent1 ),
                            LRUCache({ max: QUERY_CACHE_SIZE }) );


export const search = opts => {
  let { agent0, agent1, offset, limit } = opts;
  return tryPromise( () => searchAll(agent0.toUpperCase(), agent1.toUpperCase()) )
    .then( intns => intns.slice( offset, offset + limit ) )
    .catch( err => {
      logger.error(`Finding indra interactions failed`);
      logger.error(err);

      throw err;
    } );
};
