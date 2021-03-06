var translationUtils = require('@medic/translation-utils');

var DEFAULT_LOCALE = 'en',
    DOC_ID_PREFIX = 'messages-';

angular.module('inboxServices').factory('TranslationLoader',
  function(
    $q,
    DB,
    Settings
  ) {
    'use strict';
    'ngInject';

    var getLocale = function(options) {
      if (options.key) {
        return $q.resolve(options.key);
      }
      return Settings().then(function(settings) {
        return settings.locale || DEFAULT_LOCALE;
      });
    };

    var mapTesting = function(doc) {
      Object.keys(doc).forEach(function(key) {
        doc[key] = '-' + doc[key] + '-';
      });
    };

    return function(options) {
      var testing = false;
      if (options.key === 'test') {
        options.key = 'en';
        testing = true;
      }
      return getLocale(options)
        .then(function(locale) {
          return DB().get(DOC_ID_PREFIX + locale);
        })
        .then(function(doc) {
          let values = Object.assign(doc.generic || {}, doc.custom || {});
          if (testing) {
            mapTesting(values);
          }
          return translationUtils.loadTranslations(values);
        })
        .catch(function(err) {
          if (err.status !== 404) {
            throw err;
          }
          return {};
        });
    };
  }
);
