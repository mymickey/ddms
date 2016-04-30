var Promise = require("bluebird"),
  mongoose = Promise.promisifyAll(require('mongoose')),
  Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId,
  Mixed = Schema.Types.Mixed,
  shortid = require('shortid');

var page = new Schema({
  user: {type: ObjectId, ref: 'User'},
  project: {type: ObjectId, ref: 'Project'},
  sid: {type: String, unique: true,'default': shortid.generate },
  title: {
    type: String,
    required: true,
    default: 'New page'
  },
  desc: String,
  createDateTime: {
    type: Date,
    default: Date.now
  },
  updateDateTime: {
    type: Date,
    default: Date.now
  },
  htmlContent: {type:String,required:true},
  cdnURL:String,
  formId:String,
  htmlFileName:String
});

page.static({
  list: function (callback) {
    return this.find()
      .populate('user',{_id: 1,name: 1,email: 1,role: 1})
      .populate('project',{_id: 1,name: 1,desc: 1})
      .sort({_id: -1})
      .exec(callback)
  },
  listByProjectId: function (projectid,callback) {
    return this.find({project: projectid})
      .populate('user',{_id: 1,name: 1,email: 1,role: 1})
      .populate('project',{_id: 1,name: 1,desc: 1})
      .sort({_id: -1})
      .exec(callback);
  }
});

module.exports = mongoose.model('Page', page);
