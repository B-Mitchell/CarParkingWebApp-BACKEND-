const mongoose = require('mongoose');

const vehicleRegistrationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  plateNumber: String,
  make: String,
  model: String,
});

const VehicleRegistration = mongoose.model('VehicleRegistration', vehicleRegistrationSchema);

module.exports = VehicleRegistration;
