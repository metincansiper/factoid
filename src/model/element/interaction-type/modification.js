const InteractionType = require('./interaction-type');
const { PARTICIPANT_TYPE } = require('../participant-type');
const { MODS } = require('../entity-mods');
const { BIOPAX_TEMPLATE_TYPE, BIOPAX_CONTROL_TYPE } = require('./biopax-type');

const VALUE = 'modification';
const DISPLAY_VALUE = 'Modification';


class Modification extends InteractionType {
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

  toBiopaxTemplate(){
    let source = this.getSourceSkipErrors();
    let target = this.getTargetSkipErrors();

    let srcName = source.name() || '';
    let tgtName = target.name() || '';

    let modification = target.modification().value;
    let templateType = ( modification === MODS.UNMODIFIED.value )
            ? BIOPAX_TEMPLATE_TYPE.ACTIVATION_INHIBITION : BIOPAX_TEMPLATE_TYPE.PROTEIN_MODIFICATION;

    let controlType = this.isInhibition() ? BIOPAX_CONTROL_TYPE.INHIBITION : BIOPAX_CONTROL_TYPE.ACTIVATION;

    let template = {
      type: templateType,
      controllerProtein: srcName,
      targetProtein: tgtName,
      controlType: controlType
    };

    if (templateType === BIOPAX_TEMPLATE_TYPE.PROTEIN_MODIFICATION) {
      template.modification = modification;
    }

    return template;
  }

  toString(){
    let tgt = this.getTarget();
    let verb = (this.isInhibition() ? 'inhibits' : 'promotes');

    let mod;

    switch( tgt.modification().value ){
      case MODS.PHOSPHORYLATED.value:
        mod = 'phosphorylation';
        break;
      case MODS.METHYLATED.value:
        mod = 'methylation';
        break;
      case MODS.UBIQUINATED.value:
        mod = 'ubiquination';
        break;
      default:
        mod = 'modification';
        break;
    }

    let obj = `the ${mod} of`;

    return super.toString( `${verb} ${obj}` );
  }

  static get value(){ return VALUE; }
  get value(){ return VALUE; }

  static get displayValue(){ return DISPLAY_VALUE; }
  get displayValue(){ return DISPLAY_VALUE; }
}

module.exports = Modification;
