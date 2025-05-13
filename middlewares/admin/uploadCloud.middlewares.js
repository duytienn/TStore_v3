const uploadToCloudDinary = require("../../helpers/uploadCloudDinary");

module.exports.upload = async (req, res, next) => {
  if(req.file){
    const result = await uploadToCloudDinary(req.file.buffer);
    req.body[req.file.fieldname] = result;
  } 
  next();
}