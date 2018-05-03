const InteractionType = require('./interaction-type');
const { PARTICIPANT_TYPE } = require('../participant-type');
const { MODS } = require('../entity-mods');

const VALUE = 'activationInhibition';
const DISPLAY_VALUE = 'ActivationInhibition';

class ActivationInhibition extends InteractionType {
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

    return [T.POSITIVE, T.NEGATIVE];
  }

  areParticipantsTyped(){
    return this.isSigned();
  }

  static isAllowedForInteraction( intn ){
    let ppts = intn.participants();
    let isProtein = ent => true || ent.type() === 'protein';

    return ppts.length === 2 && ppts.every( isProtein );
  }

  toString(){
    return super.toString( this.isInhibition() ? 'inhibits' : 'activates' );

  }

  static get value(){ return VALUE; }
  get value(){ return VALUE; }

  static get displayValue(){ return DISPLAY_VALUE; }
  get displayValue(){ return DISPLAY_VALUE; }
}

module.exports = ActivationInhibition;
