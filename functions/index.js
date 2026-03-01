const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Takes a user's email and gives them admin privileges.
 * @param {object} data The data passed to the function, must include email.
 * @param {object} context The authentication context of the user calling it.
 * @return {object} A result object with a message or an error.
 */
exports.addAdminRole = functions.https.onCall((data, context) => {
  // Security: Check if the request is made by an already-existing admin.
  if (context.auth.token.admin !== true) {
    return {error: "Only admins can add other admins."};
  }

  // Get user and add a custom claim (admin) to their token
  return admin.auth().getUserByEmail(data.email).then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  }).then(() => {
    return {message: `Success! ${data.email} has been made an admin.`};
  }).catch((err) => {
    return {error: err.message};
  });
});