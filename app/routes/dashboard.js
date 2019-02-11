import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

var DashboardRoute;

DashboardRoute = Route.extend({
  channelName: 'ShortMessageChannel',
  opportunityId: 123,
  contactPhoneNumberId: 123,
  protocol: 'ws',
  host: 'localhost:3000',
  token: 'xxx',
  cableService: service('cable'),
  beforeModel: function() {
    this._super(...arguments);

  },
  model: function() {

  },
  afterModel: function(model) {

  },
  setupController: function(controller) {
    this._super.apply(this, arguments);
    let route = this;
    let path = `${this.get('protocol')}://${this.get('token')}@${this.get('host')}/cable`;
    console.log(path);
    let consumer = this.get('cableService').createConsumer(path);
    let data = {
      opportunity_id: this.get('opportunityId'),
      contact_phone_number_id: this.get('contactPhoneNumberId'),
    }
    console.log(data);
    const subscription = consumer.subscriptions.create(this.get('channelName'), {
      connected() {
        controller.set('wsStatus', 'connected');
        console.log('connected');
        this.perform("follow", data);
      },
      received(resp) {
        controller.set('wsStatus', 'received');
        console.log('received');
        let payload = JSON.parse(resp.payload);
        controller.set('sms', payload.data);
        console.log(payload);
      },
      disconnected() {
        controller.set('wsStatus', 'disconnected');
        console.debug("disconnected");
      }
    });
    controller.set('subscription', subscription);
    controller.set('consumer', consumer);
  },
  resetController: function(controller, isExiting/*, transition*/) {
    this.controller.get('subscription').unsubscribe();
    this.controller.get('consumer').destroy();
  },
});

export default DashboardRoute;
