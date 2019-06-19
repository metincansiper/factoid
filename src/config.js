import _ from 'lodash';
import { isClient } from './util';

const env = (key, defaultVal) => {
  if( process.env[key] != null ){
    let val =  process.env[key];

    if( _.isInteger(defaultVal) ){
      val = parseInt(val);
    }
    else if( _.isBoolean(defaultVal) ){
      val = JSON.parse(val);
    }

    return val;
  } else {
    return defaultVal;
  }
};

const DEFAULT_CACHE_SIZE = parseInt( process.env.DEFAULT_CACHE_SIZE ) || 1000;

export const PORT = env('PORT', 3000);

export const LOG_LEVEL = env('LOG_LEVEL', 'info');

// Connect to localhost
export const SOCKET_HOST = env('SOCKET_HOST', isClient() ? window.location.hostname : 'localhost');

// Use localhost db with no auth by default (default rethink config).
export const DB_NAME = env('DB_NAME', 'factoid');
export const DB_HOST = env('DB_HOST', 'localhost');
export const DB_PORT = env('DB_PORT', 28015);
export const DB_USER = env('DB_USER', undefined); // username if db uses auth
export const DB_PASS = env('DB_PASS', undefined); // password if db uses auth
export const DB_CERT = env('DB_CERT', undefined);  // path to a certificate (cert) file if db uses ssl

export const BASE_URL = env('BASE_URL', 'https://factoid.baderlab.org');

// Services
export const REACH_URL = env('REACH_URL', 'http://reach.baderlab.org/api/uploadFile');
export const UNIPROT_URL = env('UNIPROT_URL', 'http://www.uniprot.org/uniprot');
export const UNIPROT_LINK_BASE_URL = env('UNIPROT_LINK_BASE_URL', 'http://www.uniprot.org/uniprot/');
export const UNIPROT_CACHE_SIZE = env('UNIPROT_CACHE_SIZE', DEFAULT_CACHE_SIZE);
export const CHEBI_WSDL_URL = env('CHEBI_WSDL_URL', 'https://www.ebi.ac.uk/webservices/chebi/2.0/webservice?wsdl');
export const CHEBI_JAVA_PACKAGE = env('CHEBI_JAVA_PACKAGE', 'uk.ac.ebi.chebi.webapps.chebiWS.model');
export const CHEBI_LINK_BASE_URL = env('CHEBI_LINK_BASE_URL', 'https://www.ebi.ac.uk/chebi/searchId.do?chebiId=');
export const CHEBI_CACHE_SIZE = env('CHEBI_CACHE_SIZE', DEFAULT_CACHE_SIZE);
export const PUBCHEM_BASE_URL = env('PUBCHEM_BASE_URL', 'https://pubchem.ncbi.nlm.nih.gov/rest/pug');
export const PUBCHEM_LINK_BASE_URL = env('PUBCHEM_LINK_BASE_URL', 'https://pubchem.ncbi.nlm.nih.gov/compound/');
export const PUBCHEM_CACHE_SIZE = env('PUBCHEM_CACHE_SIZE', DEFAULT_CACHE_SIZE);
export const AGGREGATE_CACHE_SIZE = env('AGGREGATE_CACHE_SIZE', DEFAULT_CACHE_SIZE);
export const MAX_SEARCH_SIZE = env('MAX_SEARCH_SIZE', 50);
export const BIOPAX_CONVERTER_URL = env('BIOPAX_CONVERTER_URL', 'https://biopax.baderlab.org/convert/v2/');
export const PC_URL = env('PC_URL', 'https://apps.pathwaycommons.org/');
export const GROUNDING_SEARCH_BASE_URL = env('GROUNDING_SEARCH_BASE_URL', 'http://localhost:3001');
export const NCBI_LINK_BASE_URL = env('NCBI_LINK_BASE_URL', 'https://www.ncbi.nlm.nih.gov/gene/');

// Email
export const EMAIL_ENABLED = env('EMAIL_ENABLED', false);
export const EMAIL_FROM = env('EMAIL_FROM', 'Factoid');
export const EMAIL_FROM_ADDR = env('EMAIL_FROM_ADDR', 'support@mentana.org');
export const SMTP_PORT = env('SMTP_PORT', 465);
export const SMTP_HOST = env('SMTP_HOST', 'localhost');
export const SMTP_USER = env('SMTP_USER', 'user');
export const SMTP_PASSWORD = env('SMTP_PASSWORD', 'password');

export const USE_PC_GROUNDING_SEARCH = env('USE_PC_GROUNDING_SEARCH', false);

// client vars:
// these vars are always included in the bundle because they ref `process.env.${name}` directly
// NB DO NOT include passwords etc. here
export const NODE_ENV = env('NODE_ENV', undefined);
// TODO: revise
// export const BASE_URL = env('BASE_URL', undefined);
// export const PC_URL = env('PC_URL', undefined);
