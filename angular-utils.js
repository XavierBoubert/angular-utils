(function() {
  'use strict';

  // Convert JavaScript native object to an angular module with its factories
  angular.makeModule = function(moduleName, Obj, dependecies) {
    dependecies = dependecies || [];

    if(Obj.toString() !== '[object Object]') {
      Obj = new Obj();
    }

    var module = angular.module(moduleName, dependecies);

    angular.extendModule(moduleName, null, Obj);

    return module;
  };

  // Create an angular module factory from a JavaScript native object
  angular.extendModule = function(moduleName, objectName, obj) {
    var module = angular.module(moduleName);
    objectName = objectName ? '.' + objectName : '';

    if(module && typeof obj != 'undefined' && obj) {
      angular.forEach(obj, function(value, key) {
        if(key != 'constants') {
          module.factory(moduleName + objectName + '.' + key, function() {
            return obj[key];
          });
        }
      });
    }

    return module;
  };

  // Get object size
  angular.objectLength = function(obj) {
    var length = 0, key;
    for(key in obj) {
      length += obj.hasOwnProperty(key) && key != '$$hashKey' ? 1 : 0;
    }
    return length;
  };

  // Map object (like Array) with a function called for each value
  angular.mapObject = function(obj, func) {
    obj = $.extend(true, {}, obj);

    angular.forEach(obj, function(value, key) {
      if($.isPlainObject(value)) {
        obj[key] = angular.mapObject(value, func);
      }
      else {
        obj[key] = func(value, key);
      }
    });

    return obj;
  };

  // Filter object (like Array) with a function called for each value
  angular.filterObject = function(obj, func, recursive) {
    recursive = recursive || false;
    var newObj = {};

    angular.forEach(obj, function(value, key) {
      if(func(value, key)) {
        newObj[key] = value;

        if(recursive && $.isPlainObject(newObj[key])) {
          newObj[key] = angular.filterObject(newObj[key], func, recursive);
        }
      }
    });

    return newObj;
  };

  // Utils module with its helpers
  angular.module('Angular.Utils')

    // Extend $scope with new helpers
    .factory('Angular.Addons.ImproveScope', function() {
      return function() {

        var _scope = this;

        // Call digest() after finishing the current one
        this.$nextDigest = function(deffered) {
          deffered = typeof deffered == 'undefined' ? true : deffered;

          if(_scope.$$phase) {
            if(deffered) {
              setTimeout(function() {
                _scope.$digest();
              });
            }
          }
          else {
            _scope.$digest();
          }
        };

        // Call apply() after finishing the current one
        this.$nextApply = function(deffered) {
          deffered = typeof deffered == 'undefined' ? true : deffered;

          if(_scope.$$phase) {
            if(deffered) {
              setTimeout(function() {
                _scope.$apply();
              });
            }
          }
          else {
            _scope.$apply();
          }
        };

      };
    })

    // http://www.gnu.org/software/gettext/
    // need i18n() function with all of your translations
    .factory('Angular.Addons.GettextManager', function() {
      return function GettextManager() {
        var _this = this;

        // Ex. :
        // label.isdev=%s is a dev
        // _('label.isdev', ['Test']);
        // Result: Test is a dev
        this._ = function(labelName, replaces) {
          labelName = labelName || '';
          replaces = replaces || [];

          var label = i18n(labelName) || '';
          for(var i = 0; i < replaces.length; i++) {
            label = label.replace(/%s/, replaces[i]);
          }
          return label;
        };

        // Ex. :
        // label.object=%s has %n object
        // label.objects=%s has %n objects
        // _n('label.object', 'label.objects', 2, ['Test']);
        // Result: Test has 2 objects
        this._n = function(labelName, labelNamePlural, number, replaces) {
          labelName = labelName || '';
          labelNamePlural = labelNamePlural || '';
          number = number || false;
          replaces = replaces || [];

          var label = _this._(!number || number <= 1 ? labelName : labelNamePlural, replaces);
          return label.replace(/%n/g, number);
        };
      };
    });

})();