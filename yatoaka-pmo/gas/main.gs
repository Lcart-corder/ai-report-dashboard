/**
 * doGet / doPost ルーター — REST 風 API
 *
 * GET  ?resource=ping                → ヘルスチェック
 * GET  ?resource=bootstrap           → { projects, tasks, meetings }
 * GET  ?resource=projects|tasks|meetings → 一覧
 *
 * POST body(JSON, Content-Type: text/plain) :
 *   { "resource": "projects|tasks|meetings", "action": "create|update|delete", "payload": {...} }
 *   delete は payload.id もしくは { "id": "..." }
 *
 * 注: ブラウザからの POST は プリフライトを避けるため Content-Type: text/plain で送る。
 */

function doGet(e) {
  try {
    var resource = (e && e.parameter && e.parameter.resource) || 'ping';

    if (resource === 'ping') {
      return successResponse({ ok: true, service: 'yatoaka-pmo', time: nowIso() });
    }
    if (resource === 'bootstrap') {
      return successResponse(getBootstrap());
    }
    if (CONFIG.RESOURCE_TO_SHEET[resource]) {
      return successResponse(listRecords(resource));
    }
    return errorResponse('BAD_RESOURCE', '未対応のリソース: ' + resource);
  } catch (err) {
    return errorResponse('GET_ERROR', err.message);
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var resource = body.resource;
    var action = body.action;
    var payload = body.payload || {};

    if (!resource || !CONFIG.RESOURCE_TO_SHEET[resource]) {
      return errorResponse('BAD_RESOURCE', '未対応のリソース: ' + resource);
    }

    switch (action) {
      case 'create':
        return successResponse(createRecord(resource, payload));
      case 'update':
        return successResponse(updateRecord(resource, payload));
      case 'delete':
        return successResponse(deleteRecord(resource, payload.id || body.id));
      default:
        return errorResponse('BAD_ACTION', '未対応のアクション: ' + action);
    }
  } catch (err) {
    return errorResponse('POST_ERROR', err.message);
  }
}
