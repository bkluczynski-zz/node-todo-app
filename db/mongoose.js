const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_CHARCOAL_URI);

module.exports = {
  mongoose,
};
