const h = require('react-hyperscript');
const { Link } = require('react-router-dom');
const React = require('react');

class Home extends React.Component {
  render(){
    return h('div.home', [
      // main part of home page
      h('div.home-center', [
        // A row that includes Factoid logo and short description of Factoid
        h('div.home-intro-row', [
          h('i.home-icon'),
          h('div', [
            h('h1.home-into-header', 'Factoid'),
            h('p.home-intro-desc', 'A project to digitally capture biological data from academic papers')
          ])
        ]),
        // Links to choose the mode
        h('div.home-mode-links', [
          h('span.home-mode-link', [ h(Link, { className: 'plain-link', to: '/new-document' }, 'Create new, blank document') ]),
          h('span.home-mode-link-seperator', '-'),
          h('span.home-mode-link', [ h(Link, { className: 'plain-link', to: '/new-document/fill' }, 'Create new document, filled from text') ])
        ])
      ]),
      // Footer for the main page
      h('div.home-footer', [
        h('div.home-section', [
          // A more detailed description of Factoid
          h('span', 'Factoid is a new bioinformatics technology designed to increase impact of papers by making the genes and interactions that are described by the users easier for others to discover and reuse.'),

          h('p'),

          // References to some of the used technologies
          h('span', 'Factoid utilizes '),
          h('span', [ h('a', { className: 'home-link', href: 'http://agathon.sista.arizona.edu:8080/odinweb/', target: '_blank' }, 'REACH') ]),
          h('span', ' for extraction of the biomedical information and '),
          h('span', [ h('a', { className: 'home-link', href: 'http://js.cytoscape.org/', target: '_blank' }, 'Cytoscape.js') ]),
          h('span', ' for network visualization while making use of biological databases such as '),
          h('span', [ h('a', { className: 'home-link', href: 'http://www.pathwaycommons.org/pc2/', target: '_blank' }, 'Pathway Commons') ]),
          h('span', ' and '),
          h('span', [ h('a', { className: 'home-link', href: 'http://www.uniprot.org/uniprot/', target: '_blank' }, 'Uniprot') ]),
          h('span', '.'),

          h('p'),

          // Information about the development team
          h('span', 'Factoid is being developed by Gary Bader, Max Franz, Dylan Fong, Jeffrey Wong of the '),
          h('span', [ h('a', { className: 'home-link', href: 'http://baderlab.org/', target: '_blank' }, 'Bader Lab') ]),
          h('span', ' at the '),
          h('span', [ h('a', { className: 'home-link', href: 'https://www.utoronto.ca/', target: '_blank' }, 'University of Toronto') ]),
          h('span', ', Chris Sander, Christian Dallago, Augustin Luna of the '),
          h('span', [ h('a', { className: 'home-link', href: 'http://www.sanderlab.org/', target: '_blank' }, 'Sander Lab') ]),
          h('span', ' at the '),
          h('span', [ h('a', { className: 'home-link', href: 'http://www.dana-farber.org/', target: '_blank' }, 'Dana-Farber Cancer Institute') ]),
          h('span', ' and '),
          h('span', [ h('a', { className: 'home-link', href: 'http://hms.harvard.edu/', target: '_blank' }, 'Harvard Medical School') ]),
          h('span', ' and Emek Demir, Funda Durupinar Babur, David Servillo, Metin Can Siper of the Pathways and Omics Lab at '),
          h('span', [ h('a', { className: 'home-link', href: 'http://www.ohsu.edu/', target: '_blank' }, 'Oregon Health & Science University') ]),
          h('span', '.'),

          h('p'),

          // Link to Factoid GitHub page
          h('a', { className: 'home-link', href: 'https://github.com/PathwayCommons/factoid', target: '_blank' }, [
            h('i', { className: 'fa-github fa fa-2x' })
          ])
        ]),

      ])
    ]);
  }
}

module.exports = Home;
