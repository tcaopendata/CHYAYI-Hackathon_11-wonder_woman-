var apiurl = require('../utility/apiurl');
var builder = require('botbuilder');
var request = require("request-promise");

var reply = require('../utility/reply');
var fortuneTeller = require('./fortune');

module.exports = [
  async(session, args, next) => {
    session.beginDialog('/askFBLocation');
  },
  async(session, results) => {
    var entityList = session.message.entities;

    var latitude = '23.4731294';
    var longitude = '120.29271649999998';

    if(session.userData.latitude != null) {
      latitude = session.userData.latitude;
      longitude = session.userData.longitude;
    } else {
      session.send('那我來找找故宮南院附近的充電站!');
    }

    var body = await request.get(apiurl + '/power?lat=' + latitude + '&lng=' + longitude + '&limit=5&distance=10000');

    var res = JSON.parse(body);

    var attachments = [];
    console.log('res', res);
    if (res.data.length) {
      res.data.forEach(function(w) {
        var card = createThumbnailCard(session, w);
        attachments.push(card);
      });
    } else {
      session.send('很抱歉~這附近找不到');
      session.endDialog();
    }

    var reply = new builder.Message(session)
      .attachmentLayout(builder.AttachmentLayout.carousel)
      .attachments(attachments);
    session.send(reply);
    session.endDialog();

  }
];

function createThumbnailCard(session, info) {
  var image = 'https://maps.googleapis.com/maps/api/staticmap?center=' + info.lat + ',' + info.lng + '&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7Clabel:' + info.lat + ',' + info.lng + '&key=';
  return new builder.ThumbnailCard(session)
    .title(info.title)
    .text(`地址: ${info.address} \n\n
      位置: ${info.local} \n\n
      `)
    .images([
      builder.CardImage.create(session, image)
    ]).buttons([
      builder.CardAction.openUrl(session, 'https://www.google.com/maps/search/?api=1&query=' + info.lat + ',' + info.lng + '', '前往導航')
    ]);
}
