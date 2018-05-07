const BIOPAX_TEMPLATE_TYPE = Object.freeze({
  ACTIVATION_INHIBITION: 'Activation Inhibition',
  EXPRESSION_REGULATION: 'Expression Regulation',
  PHYSICAL_INTERACTION: 'Physical Interaction',
  PROTEIN_MODIFICATION: 'Protein Modification'
});

const BIOPAX_CONTROL_TYPE = Object.freeze({
  INHIBITION: 'inhibition',
  ACTIVATION: 'activation'
});

module.exports = { BIOPAX_TEMPLATE_TYPE, BIOPAX_CONTROL_TYPE };
