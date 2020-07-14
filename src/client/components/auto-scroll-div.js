import React from 'react';
import h from 'react-hyperscript';
import ReactDom from 'react-dom';

// See https://gist.github.com/ydeshayes/cb6240c9e0547e49fdd451ee5d66efd7
class AutoScrollDiv extends React.Component {
  constructor(props){
    super(props);
  }

  // Edit from http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
  componentDidMount() {
    const node = ReactDom.findDOMNode(this);
    node.scrollTop = node.scrollHeight;
  }

  componentWillUpdate() {
    const node = ReactDom.findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate(prevProps) {
    if (this.shouldScrollBottom) {
      const node = ReactDom.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    let { childrenContent, className } = this.props;
    return h('div', { className }, childrenContent );
  }
}

export default AutoScrollDiv;
