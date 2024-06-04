module.exports = {
  subdomain: null,
  publicHomeRoute: '/auth/signin',
  applianceJwtExpiresIn: '10y',
  /* database field encryption key : 32 bytes - must be changed by every installation */
  dataEncryptionKey: 'V6g5oHJZb7KcazJyL6cM95XvIDouon5b',
  password: {
    lowerCase: true,
    upperCase: false,
    digit: true,
    specialCharacter: true,
    allowRepeat: true,
    useTightPattern: true,
    useLoosePattern: false,
    tightCharacterLength: 8,
    looseCharacterLength: 15,
    history: 2,
    /* strongly recommended to make changes during installation */
    defaultPassword: 'dkswjsrkafl1!'
  },
  /* 
    Only When 'disableUserSignupProcess' is set to false,
    a user-initiated user registration process is provided. 
    When this value is true, the 'defaultPassword' for the password must be configured.
  */
  disableUserSignupProcess: false,
  i18n: {
    languages: [
      {
        code: 'ko-KR',
        display: '한국어'
      }
    ],
    defaultLanguage: 'ko-KR',
    disableUserFavoredLanguage: true
  },
  scheduler: {
    /* Name to be used for setting client's "application" properties when registering a schedule */
    application: 'dssp',
    /* Base endpoint to be used for setting "callback" properties when registering a schedule */
    callbackBase: 'http://localhost:3000',
    /* 
      Scheduler service endpoint
      caution) endpoint for "localhost" has some problem. 
      https://github.com/node-fetch/node-fetch/issues/1624
    */
    endpoint: 'http://127.0.0.1:9902'
  }
}
