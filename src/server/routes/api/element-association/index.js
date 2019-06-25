import { USE_PC_GROUNDING_SEARCH } from '../../../../config';
import * as aggregate from './aggregate';
import * as groundingSearch from './grounding-search';
import Express from 'express';

const jsonifyResult = response => ( result => response.json( result ) );
const http = Express.Router();
const provider = USE_PC_GROUNDING_SEARCH ? groundingSearch : aggregate;

http.post('/search', function( req, res ){
  (
    provider.search( req.body )
    .then( jsonifyResult(res) )
    .catch( err => res.status(500).send(err) )
  );
});

http.post('/get', function( req, res ){
  (
    provider.get( req.body )
    .then( jsonifyResult(res) )
    .catch( err => res.status(500).send(err) )
  );
});

export default http;
