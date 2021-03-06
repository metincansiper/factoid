const DirtyComponent = require('../dirty-component');
const h = require('react-hyperscript');
const NotificationBase = require('./base');
const { makeClassList } = require('../../../util');

class CornerNotification extends DirtyComponent {
  constructor(props){
    super(props);

    let { notification: ntfn } = props;

    ntfn.on('activate', () => this.dirty());
    ntfn.on('deactivate', () => this.dirty());
  }

  render(){
    let { notification, className } = this.props;

    return super.render( h('div.corner-notification', {
      className: makeClassList({
        'corner-notification-active': notification.active()
      }) + ' ' + className
    }, [
      h(NotificationBase, { notification })
    ]) );
  }
}

module.exports = CornerNotification;
