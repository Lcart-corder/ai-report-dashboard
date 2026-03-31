/**
 * メインルーター — doGet / doPost
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var action, params;
    if (method === 'GET') {
      action = e.parameter.action;
      params = e.parameter;
    } else {
      var body = JSON.parse(e.postData.contents);
      action = body.action;
      params = body.params || {};
    }

    var handlers = {
      'getCurrentUser':       function() { return getCurrentUser(params); },
      'createReport':         function() { return createReport(params); },
      'getReport':            function() { return getReport(params); },
      'getReportsByDate':     function() { return getReportsByDate(params); },
      'getTimeSlots':         function() { return getTimeSlots(params); },
      'getProductionInput':   function() { return getProductionInput(params); },
      'saveProductionInput':  function() { return saveProductionInput(params); },
      'deleteProductionInput':function() { return deleteProductionInput(params); },
      'getDailySummary':      function() { return getDailySummary(params); },
      'submitForApproval':    function() { return submitForApproval(params); },
      'approveReport':        function() { return approveReport(params); },
      'rejectReport':         function() { return rejectReport(params); },
      'getStopCodes':         function() { return getStopCodes(params); },
      'getUsers':             function() { return getUsers(params); },
      'getMyReports':         function() { return getMyReports(params); },
      'getPendingApprovals':  function() { return getPendingApprovals(params); },
    };

    if (!handlers[action]) {
      return errorResponse('UNKNOWN_ACTION', 'Unknown action: ' + action);
    }

    var result = handlers[action]();
    return successResponse(result);
  } catch (error) {
    return errorResponse('SERVER_ERROR', error.message);
  }
}
