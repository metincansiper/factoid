const InteractionType = require('./interaction-type');
const { PARTICIPANT_TYPE } = require('../participant-type');

const VALUE = 'molecularInteraction';
const DISPLAY_VALUE = 'MolecularInteraction';

class MolecularInteraction extends InteractionType {
  constructor( intn ){
    super( intn );
  }

  isPromotion(){
    return this.isPositive();
  }

  isInhibition(){
    return this.isNegative();
  }

  setAsPromotionOf( ppt ){
    return this.setParticipantAsPositive( ppt );
  }

  setAsInhibitionOf( ppt ){
    return this.setParticipantAsNegative( ppt );
  }

  allowedParticipantTypes(){
    const T = PARTICIPANT_TYPE;

    return [T.UNSIGNED];
  }

  areParticipantsTyped(){
    return this.isSigned();
  }

  setMolecularInteractionType(val){
    this.molecularInteractionType = val;
  }

  getMolecularInteractionType(){
    return this.molecularInteractionType;
  }

  static isAllowedForInteraction( intn ){
    let ppts = intn.participants();
    let isProtein = ent => true || ent.type() === 'protein';
    let isChemical = ent => ent.type() === 'chemical';

    return ppts.length >= 2 && ppts.some( isProtein ) && ppts.some( isChemical );
  }

  toString(){

    return super.toString( this.getMolecularInteractionType());
  }

  static get value(){ return VALUE; }
  get value(){ return VALUE; }

  static get displayValue(){ return DISPLAY_VALUE; }
  get displayValue(){ return DISPLAY_VALUE; }
}

module.exports = MolecularInteraction;
