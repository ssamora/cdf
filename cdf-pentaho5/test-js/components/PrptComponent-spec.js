/*!
 * Copyright 2002 - 2014 Webdetails, a Pentaho company.  All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to  http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or  implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define(["cdf/Dashboard.Clean", "cdf/components/PrptComponent"],
  function(Dashboard, PrptComponent) {

  /**
   * ## The Pentaho Reporting Component
   */
  describe("The Pentaho Reporting Component #", function() {

    var dashboard = new Dashboard();

    dashboard.init();

    var optionData = {
      funcValue: 2,
      value: 'one',
      funcArray: [1,'two'],
      array: [1,'two'],
      path: "fakePath/report.prpt",
      paginate: true,
      usePost:false,
      showParameters: true,
      iframe: true,
      executeAtStart: true,
      staticValue: "staticValue"
    };

    dashboard.addParameter('funcValue', function() { return  optionData.funcValue; });
    dashboard.addParameter('value', optionData.value);
    dashboard.addParameter('funcArray', function() { return  optionData.funcArray; });
    dashboard.addParameter('array', optionData.array);

    var prptComponent = new PrptComponent(dashboard, {
      name: "prptComponent",
      type: "prptComponent",
      htmlObject: "sampleObject",
      path: optionData.path,
      parameters: [['funcValue','funcValue'],['value','value'],['funcArray','funcArray'],
        ['array','array'],['staticValue', 'staticValue']],
      paginate: optionData.paginate,
      usePost:optionData.usePost,
      showParameters: optionData.showParameters,
      iframe: optionData.iframe,
      executeAtStart: optionData.executeAtStart
    });

    dashboard.addComponent(prptComponent);

    /**
     * ## The Pentaho Reporting Component # Update Called
     */
    it("Update Called", function(done) {
      spyOn(prptComponent, 'update').and.callThrough();
      dashboard.update(prptComponent);
      setTimeout(function() {
        expect(prptComponent.update).toHaveBeenCalled();
        done();
      }, 100);
    });

    /**
     * ## The Pentaho Reporting Component # setIframeUrl Called
     */
    it("Update Called", function(done) {
      spyOn(prptComponent, 'update').and.callThrough();
      spyOn(prptComponent, 'setIframeUrl');
      dashboard.update(prptComponent);
      setTimeout(function() {
        expect(prptComponent.update).toHaveBeenCalled();
        expect(prptComponent.setIframeUrl).toHaveBeenCalled();
        done();
      }, 100);
    });

    /**
     * ## The prpt Component # Verify returned value from getOptions
     */
    it("Verify returned value from getOptions", function() {
      var options = prptComponent.getOptions();

      expect(options.path).toEqual(optionData.path);
      expect(options.showParameters).toEqual(optionData.showParameters);
      expect(options.paginate).toEqual(optionData.paginate);
      expect(options.autoSubmit).toEqual(optionData.autoSubmit || optionData.executeAtStart || false);
      expect(options['dashboard-mode']).toEqual(!optionData.iframe);
      expect(options.renderMode).toEqual('REPORT');
      expect(options.htmlProportionalWidth).toEqual(false);
      expect(options.funcValue).toEqual(optionData.funcValue);
      expect(options.value).toEqual(optionData.value);
      expect(options.funcArray).toEqual(optionData.funcArray);
      expect(options.array).toEqual(optionData.array);
      expect(options.staticValue).toEqual(optionData.staticValue);
      expect(options['output-target']).toEqual('table/html;page-mode=page');
      expect(options['accept-page']).toEqual(0);
    });

    /**
     * ## The prpt Component # Verify returned value from getParams
     */
    it("Verify returned value from getParams", function() {
      var params = prptComponent.getParams();

      expect(params['output-target']).toEqual('table/html;page-mode=page');
      expect(params['accept-page']).toEqual(0);
      expect(params.funcValue).toEqual(optionData.funcValue);
      expect(params.value).toEqual(optionData.value);
      expect(params.funcArray).toEqual(optionData.funcArray);
      expect(params.array).toEqual(optionData.array);
      expect(params.staticValue).toEqual(optionData.staticValue);
    });

    /**
     * ## The prpt Component # Verify returned value from getReportOptions
     */
    it("Verify returned value from getReportOptions", function() {
      var reportOptions = prptComponent.getReportOptions();

      expect(reportOptions.path).toEqual(optionData.path);
      expect(reportOptions.showParameters).toEqual(optionData.showParameters);
      expect(reportOptions.paginate).toEqual(optionData.paginate);
      expect(reportOptions.autoSubmit).toEqual(optionData.autoSubmit || optionData.executeAtStart || false);
      expect(reportOptions['dashboard-mode']).toEqual(!optionData.iframe);
      expect(reportOptions.renderMode ).toEqual('REPORT');
      expect(reportOptions.htmlProportionalWidth).toEqual(false);
      expect(reportOptions['output-target']).toEqual('table/html;page-mode=page');
      expect(reportOptions['accept-page']).toEqual(0);
    });
  });
});