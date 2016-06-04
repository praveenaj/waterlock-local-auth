'use strict';
var _ = require('lodash');
var authConfig = require('./waterlock-local-auth').authConfig;

/**
 * TODO these can be refactored later
 * @type {Object}
 */

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

module.exports = function(Auth, engine,params){

  if(typeof params.email !== 'undefined'){
    return generateScope('email', engine);
  }else if(typeof params.username !== 'undefined'){
    if(validateEmail(params.username)) return generateScope('email', engine);
    return generateScope('username', engine);
  }else{
    var error = new Error('Auth model must have either an email or username attribute');
    throw error;
  }
};

function generateScope(scopeKey, engine){
  return {
    type: scopeKey,
    engine: engine,
    getUserAuthObject: function(attributes, req, cb){
      var attr = {password: attributes.password};
      attr[scopeKey] = attributes[scopeKey];

      var criteria = {};
      criteria[scopeKey] = attr[scopeKey];

      if(authConfig.createOnNotFound){
        this.engine.findOrCreateAuth(criteria, attr, cb);
      }else{
        this.engine.findAuth(criteria, cb);
      }
    }
  };
}