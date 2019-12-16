import _ from 'lodash';

const NUM_AUTHORS_SHOWING = 4;
const getName = author => {
  let name = '';
  const collectiveName = _.get( author, 'CollectiveName' );
  const isPerson = _.isNull( collectiveName );
  if( isPerson ){
    const LastName = _.get( author, 'LastName' ); // required
    const ForeName = _.get( author, 'ForeName' ); // optional
    name = [ ForeName, LastName ].join(' ');

  } else {
    name = collectiveName;
  }
  return name; 
};

const getEmail = author => {
  const AffiliationInfo = _.get( author, ['AffiliationInfo'] );
  let email = [];
  if( !_.isNull( AffiliationInfo ) ) {
    const emails = AffiliationInfo.filter( info => !_.isNull( _.get( info, 'email' ) ) ).map( info => _.get( info, 'email' ) );
    email = _.uniq( _.flatten( emails ) );
  }
  return email;
};

const getContact = author => {
  const email = getEmail( author );
  const name = getName( author );
  return { name, email };
};

// Always show the last author
// Corresponding author is ambiguous in PubMed
const getAuthorString = AuthorList => {
  const leadingAuthors = _.take( AuthorList, NUM_AUTHORS_SHOWING - 1 );
  const lastAuthor =  _.last( AuthorList );
  const authorList = leadingAuthors.concat( lastAuthor );
  
  const authorStringList = _.uniq( authorList.map( getName ) );
  if( leadingAuthors.length && leadingAuthors.length < AuthorList.length - 1  ) authorStringList.splice( NUM_AUTHORS_SHOWING - 1, 0, '...' );
  return authorStringList.join(', ');
};

const getContacts = AuthorList => AuthorList.map( getContact ).filter( contact => !_.isEmpty( _.get( contact, 'email' ) ) );

const getAuthors = AuthorList => {
  let authors, contacts;
  if( AuthorList ){
    authors = getAuthorString( AuthorList );
    contacts = getContacts( AuthorList );
  }
  return { authors, contacts };
};

const getJournalNameString = Journal => {
  const hasJournalISOAbbreviation = !_.isNull( _.get( Journal, ['ISOAbbreviation'] ) ); //optional 
  const hasJournalTitle = !_.isNull( _.get( Journal, ['Title'] ) ); //optional 
  let name = '';
  if( hasJournalISOAbbreviation ){ 
    name = `${_.get( Journal, ['ISOAbbreviation'] )}.`;
  } else if( hasJournalTitle ) {
    name = `${_.get( Journal, ['Title'] )}.`;
  }

  return name;
};

const getReferenceString = Journal => {
  const journalName = getJournalNameString( Journal ); 
  const journalVolume = !_.isNull( _.get( Journal, ['Volume'] ) ) ? _.get( Journal, ['Volume'] ): ''; //optional 
  const pubDateYear = !_.isNull( _.get( Journal, ['PubDate', 'Year'] ) ) ? `(${_.get( Journal, ['PubDate', 'Year'] )})`: ''; //optional 
  return _.compact( [ journalName, journalVolume, pubDateYear ] ).join(' ');
};

const getArticleId = ( PubmedArticle, IdType ) => _.get( _.find( _.get( PubmedArticle, ['PubmedData', 'ArticleIdList'], [] ), [ 'IdType', IdType ] ), 'id' );

/**
 * getPubmedCitation
 * 
 * Retrieve a nicely formatted set of citation items from a PubmedArticle
 *  -- authors, title, and reference
 * @param {Object} PubmedArticle Returned from fetchPubmed PubmedArticleSet
 * @return {Object} result 
 * @return {String} result.authors The CollectiveName or 'LastName et al.' 
 * @return {String} result.contacts 
 * @return {String} result.title 
 * @return {String} result.reference (<ISOAbbreviation> | <Title>) <Year>; <Volume> 
 * @return {String} result.pmid
 * @return {String} result.doi
 */
const getPubmedCitation = PubmedArticle => {
  const Article = _.get( PubmedArticle, ['MedlineCitation','Article'] ); //required
  const Journal = _.get( Article, ['Journal'] ); //required
  const title = _.get( Article, ['ArticleTitle'] ); //required
  const AuthorList = _.get( Article, ['AuthorList'] ); //optional

  const { authors, contacts } = getAuthors( AuthorList ); 
  const reference = getReferenceString( Journal );
  const abstract = _.get( Article, 'Abstract' );
  const pmid = getArticleId( PubmedArticle, 'pubmed' );
  const doi = getArticleId( PubmedArticle, 'doi' );
  
  return { authors, contacts, title, reference, abstract, pmid, doi };
};

export { getPubmedCitation }; 