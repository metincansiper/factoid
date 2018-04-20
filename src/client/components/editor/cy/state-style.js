function listenToStyleChangeRequests({ bus, cy, document, controller }){
  bus.on('highlightnode', (id, style) => {
    cy.getElementById(id).style(style);
  });


}

module.exports = listenToStyleChangeRequests;
