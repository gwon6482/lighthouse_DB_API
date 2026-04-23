const mongoose = require('mongoose');

const t1TypeSchema = new mongoose.Schema({
  type_code: { type: String, required: true, unique: true, index: true },
  base_type: { type: String, required: true, index: true },
  base_name: { type: String, required: true },
  modifier_type: { type: String, enum: ['TOP2', 'BOTTOM1'], required: true },
  modifier_element: { type: String, required: true },
  modifier: { type: String, required: true },
  full_name: { type: String, required: true },
  description: { type: String, required: true }
});

const referenceDataDb = mongoose.connection.useDb(process.env.REFERENCE_DATA_DB || 'reference_data');
module.exports = referenceDataDb.model('T1Type', t1TypeSchema, 't1_types');
