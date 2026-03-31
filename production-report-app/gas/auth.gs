/**
 * ユーザー認証 — getCurrentUser
 */

function getCurrentUser(params) {
  var email = params.email;
  if (!email) throw new Error('email is required');

  var data = getSheetData(CONFIG.SHEETS.USERS);
  var user = data.rows.filter(function(r) {
    return String(r.email).toLowerCase() === email.toLowerCase()
      && String(r.is_active).toUpperCase() === 'TRUE';
  })[0];

  if (!user) throw new Error('User not found or inactive');
  return cleanRow(user);
}
