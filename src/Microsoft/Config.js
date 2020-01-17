// Register the App and get the config details from here https://aad.portal.azure.com/
module.exports = {
  appId: '<APP ID>',
  scopes: [
    "user.read",
    "calendars.read"
  ]
};