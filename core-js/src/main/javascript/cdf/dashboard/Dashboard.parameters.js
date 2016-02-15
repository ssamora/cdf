/*!
 * Copyright 2002 - 2016 Webdetails, a Pentaho company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define([
  './Dashboard',
  '../Logger',
  'amd!../lib/backbone',
  './Utf8Encoder'
], function(Dashboard, Logger, Backbone, Utf8Encoder) {

  /**
   * @class cdf.dashboard.Dashboard.parameters
   * @amd cdf/dashboard/Dashboard.parameters
   * @classdesc A class representing an extension to the Dashboard class for parameters.
   *            It's methods allow getting and saving parameters from the dashboard context.
   * @ignore
   */
  Dashboard.implement(/** @lends cdf.dashboard.Dashboard# */{
    LEGACY_STORAGE: "Dashboards.storage.",
    STORAGE: "storage.",

    /**
     * Method used by the dashboard's constructor for parameters initialization.
     *
     * @private
     */
    _initParameters: function() {
      this.parameters = [];
      this.parameterModel = new Backbone.Model();

      this.chains = [];
      this.syncedParameters = {};

      this.escapeParameterValues = false; //TODO: review
    },

    /**
     * Verifies if a parameter is available in the context.
     *
     * @private
     * @param {Object}          o    The context of the assignment.
     * @param {string|string[]} path The path to the parameter.
     * @return {boolean} _true_ if the parameter is available in the context.
     */
    _isParameterInModel: function(o, path) {
      return this._getValueFromContext(o, path) !== undefined;
    },

    /**
     * Gets the value from a context o from the property with a given path.
     *
     * @private
     * @param {Object}          o    The context of the assignment.
     * @param {string|string[]} path The path to the parameter.
     * @return {*} The value of the property or _undefined_ if the context object _o_ is a falsy value.
     */
    _getValueFromContext: function(o, path) {
      if(!o) {
        return;
      }
      if(this.flatParameters) {
        return o[path];
      } else {
        if(path != null) {
          var parts, L;
          if(path instanceof Array) {
            parts = path;
          } else {
            if(path.indexOf('.') < 0) {
              return o[path];
            }
            parts = path.split(".");
          }
          L = parts.length;

          for(var i = 0; i < L; i++) {
            if(!o) {
              return; // more efficient approximation
            }
            var part = parts[i],
                value = o[part];
            if(value === undefined) {
              return;
            }
            o = value;
          }
        }
      }
      return o;
    },

    /**
     * Sets a parameter value using a given path and a context object.
     *
     * @private
     * @param {Object}          o    The context of the assignment.
     * @param {string|string[]} path The path to the parameter.
     * @param {*}               v    The value of the parameter.
     * @return {*} The value of the parameter assigned or _undefined_ if the context object _o_ is a falsy value.
     */
    _setValueInContext: function(o, path, v) {
      if(!o || path == null || v === undefined) {
        return; // undefined
      }

      if(this.flatParameters) { //to keep compatibility with dotted parameters without requiring the path created to work
        o[path] = v;
      } else {
        var parts, pLast;
        if(path instanceof Array) {
          parts = path;
          pLast = parts.pop();
        } else {
          if(path.indexOf(".") < 0) {
            o[path] = v;
            return o;
          }
          parts = path.split(".");
          pLast = parts.pop();
        }
        o = this._getValueFromContext(o, parts);
        if(o) {
          o[pLast] = v;
        }
      }
      return o;
    },

    /**
     * Gets the parameter store location (_this.parameters_ or _this.storage_)
     * according to its name and the new name, without the store prefix.
     *
     * @private
     * @param {string} parameterName The name of the parameter.
     * @return {{store: object, name: string}} An object with the store location and the new name of the parameter (without the store prefix).
     */
    _getParameterStore: function(parameterName) {
      var parameterStore;

      if(parameterName.indexOf(this.LEGACY_STORAGE) == 0) {
        Logger.warn("Legacy storage access for " + parameterName + ". Please use storage instead");
        parameterName = parameterName.substr(this.LEGACY_STORAGE.length);
        parameterStore = this.storage;
      } else if(parameterName.indexOf(this.STORAGE) == 0) {
        parameterName = parameterName.substr(this.STORAGE.length);
        parameterStore = this.storage;
      } else {
        parameterStore = this.parameters;
      }

      return {
        store: parameterStore,
        name: parameterName
      };
    },

    /**
     * Adds a parameter to the parameter model.
     * Receives a parameter name and an initial value, that will be used
     * if the parameter is not available in the parameter model. Otherwise,
     * the value returned by {@link cdf.dashboard.Dashboard#getParameterValue|getParameterValue} is used.
     *
     * @param {string} parameterName  The name of the parameter.
     * @param {*}      parameterValue The initial value of the parameter.
     * @return {*} The value assigned to the parameter or _undefined_ if the parameter name is invalid.
     */
    addParameter: function(parameterName, parameterValue) {
      if(parameterName == undefined || parameterName == "undefined") {
        Logger.warn('Dashboard addParameter: trying to add undefined!!');
        return;
      }

      var parameterStore = this._getParameterStore(parameterName);
      if(this._isParameterInModel(parameterStore.store, parameterStore.name)) {
        parameterValue = this.getParameterValue(parameterStore.name);
      }
      this.setParameter(parameterName, parameterValue);
      return parameterValue;
    },

    /**
     * Gets a parameter value.
     *
     * @param {string} parameterName The parameter name.
     * @return {*} The value of the parameter or _undefined_ if the parameter name is invalid.
     */
    getParameterValue: function(parameterName) {
      if(parameterName == undefined || parameterName == "undefined") {
        Logger.warn('Dashboard.getParameterValue: trying to get undefined!!');
        return;
      }

      var parameterStore = this._getParameterStore(parameterName);
      return this._getValueFromContext(parameterStore.store, parameterStore.name);
    },

    /**
     * Alias for {@link cdf.dashboard.Dashboard#getParameterValue|getParameterValue}.
     *
     * @param {string} parameterName The parameter name.
     * @return {*} The parameter value or _undefined_ if the parameter name is invalid.
     */
    getParam: function(parameterName) {
      return this.getParameterValue(parameterName);
    },

    /**
     * Stores a parameter with a certain value.
     *
     * @param {string}  parameterName  The parameter name.
     * @param {*}       parameterValue The value of the parameter.
     * @param {boolean} isNotified     A flag indicating if a
     *   [<em>parameterName</em>:fireChange]{@link cdf.dashboard.Dashboard#event:"<em>parameterName</em>:fireChange"}
     *   event is to be triggered when the parameter value changes.
     */
    setParameter: function(parameterName, parameterValue, isNotified) {
      if(parameterName == undefined || parameterName == "undefined") {
        Logger.warn('Dashboard.setParameter: trying to set undefined!!');
        return;
      }

      var parameterStore = this._getParameterStore(parameterName);
      if(this.escapeParameterValues) {
        this._setValueInContext(parameterStore.store, parameterStore.name, Utf8Encoder.encode_prepare_arr(parameterValue));
      } else {
        this._setValueInContext(parameterStore.store, parameterStore.name, parameterValue);
      }

      if(this._setValueInContext(parameterStore.store, parameterStore.name, parameterValue) !== undefined) {
        this.parameterModel.set(parameterStore.name, parameterValue, {notify: isNotified});
        this.persistBookmarkables(parameterStore.name);
      }
    },

    /**
     * Alias for {@link cdf.dashboard.Dashboard#setParameter|setParameter}.
     *
     * @param {string}  parameterName  The parameter name.
     * @param {*}       parameterValue The value of the parameter.
     * @param {boolean} isNotified     A flag indicating if a
     *   [<em>parameterName</em>:fireChange]{@link cdf.dashboard.Dashboard#event:"<em>parameterName</em>:fireChange"}
     *   event is to be triggered when the parameter value changes.
     */
    setParam: function(parameterName, parameterValue, isNotified) {
      this.setParameter(parameterName, parameterValue, isNotified);
    },

    /**
     * Keep parameters master and slave in sync. The master parameter's initial value
     * takes precedence over the slave parameter's when initializing the dashboard.
     *
     * @private
     * @param {string} master The name of the master parameter.
     * @param {string} slave  The name of the slave parameter.
     */
    syncParameters: function(master, slave) {
      this.setParameter(slave, this.getParameterValue(master));
      this.parameterModel.on("change:" + master, function(m, v, o) {
        this[o.notify ? 'fireChange' : 'setParameter'](slave, v);
      }, this);
      this.parameterModel.on("change:" + slave, function(m, v, o) {
        this[o.notify ? 'fireChange' : 'setParameter'](master, v);
      }, this);
    },

    /**
     * Register parameter pairs that will be synced on dashboard init.
     *
     * @private
     * @param {string} master The name of the master parameter.
     * @param {string} slave  The name of the slave parameter.
     */
    syncParametersOnInit: function(master, slave) {
      /* We'll store the dependency pairings in Dashboards.syncedParameters, as an object mapping master parameters to an
       * array of all its slaves (so {a: [b,c]} means that both *b* and *c* are subordinate to *a*), and in
       * Dashboards.chains we'll store an array of arrays representing a list of separate dependency trees. An entry of
       * the form [a, b, c] means that *a* doesn't depend on either *b* or *c*, and that *b* doesn't depend on *c*.
       * Inversely, *b* depends on *a*, and *c* depends on either *a* or *b*. You can have multiple such entries, each
       * representing a completely isolated set of dependencies.
       *
       * Note that we make no effort to detect circular dependencies. Behaviour is undetermined should you provide such a
       * case.
       */
      var parameters = this.syncedParameters,
          currChain,
          masterChain,
          slaveChain,
          slaveChainIdx;

      if(!parameters[master]) { parameters[master] = []; }
      parameters[master].push(slave);

      /* When inserting an entry into Dashboards.chains, we need to check whether any of the master or the slave are
       * already in one of the chains.
       */
      for(var i = 0; i < this.chains.length; i++) {
        currChain = this.chains[i];
        if(currChain.indexOf(master) > -1) {
          masterChain = currChain;
        }
        if(currChain.indexOf(slave) > -1) {
          slaveChain = currChain;
          slaveChainIdx = i;
        }
      }
      /* If both slave and master are present in different chains, we merge the chains.
       *
       * If only one of the two is present, we insert the slave at the end of the master's chain, or the master at the
       * head of the slave's chain.
       *
       * Note that, since a parameter can be both a master and a slave, and because no slave can have two masters, it is
       * guaranteed that we can only add the master to the head of the chain if the slave was the head before, and, when
       * adding the slave at the end of the master's chain, none of the parameters between master and slave can depend on
       * the slave. This means there is no scenario where a chain can become inconsistent from prepending masters or
       * appending slaves.
       *
       * If neither master nor slave is present in the existing chains, we create a new chain with [master, slave].
       */
      if(slaveChain && masterChain) {
        if(masterChain != slaveChain) {
          var args = slaveChain.slice();
          args.unshift(0);
          args.unshift(masterChain.length);
          [].splice.apply(masterChain, args);
          this.chains.splice(slaveChainIdx, 1);
        }
      } else if(slaveChain) {
        slaveChain.unshift(master);
      } else if(masterChain) {
        masterChain.push(slave)
      } else {
        this.chains.push([master, slave]);
      }
    },

    /**
     * Iterate over the registered parameter syncing chains, and configure syncing for each parameter pair.
     *
     * @private
     */
    syncParametersInit: function() {
      var parameters = this.syncedParameters,
          master,
          slave,
          i, j, k;

      for(i = 0; i < this.chains.length; i++) {
        for(j = 0; j < this.chains[i].length; j++) {
          master = this.chains[i][j];
          if(!parameters[master]) {
            continue;
          }
          for(k = 0; k < parameters[master].length; k++) {
            slave = parameters[master][k];
            this.syncParameters(master, slave);
          }
        }
      }
    }
  });
});