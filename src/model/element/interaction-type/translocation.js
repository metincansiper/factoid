const InteractionType = require('./interaction-type');
const { PARTICIPANT_TYPE } = require('../participant-type');
const { MODS } = require('../entity-mods');

const VALUE = 'translocation';
const DISPLAY_VALUE = 'Translocation';

class Translocation extends InteractionType {
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

  setOldLocation(val){
    this.oldLocation = val;
  }

  getOldLocation(){
    return this.oldLocation;
  }

  setNewLocation(val){
    this.newLocation = val;
  }

  getNewLocation(){
    return this.newLocation;
  }


  static isAllowedForInteraction( intn ){
    let ppts = intn.participants();
    let isProtein = ent => true || ent.type() === 'protein';

    return ppts.length === 2 && ppts.every( isProtein );
  }

  toString(){
    let verb = (this.isInhibition() ? 'inhibits translocation' : 'activates translocation');

    let oldLoc = this.getOldLocation();
    let newLoc = this.getNewLocation();


    let obj = `from ${oldLoc} to ${newLoc}`;

    return super.toString( `${verb} ${obj}` );
    return super.toString( `${verb} ${obj}` );
  }

  static get value(){ return VALUE; }
  get value(){ return VALUE; }

  static get displayValue(){ return DISPLAY_VALUE; }
  get displayValue(){ return DISPLAY_VALUE; }
}

module.exports = Translocation;
