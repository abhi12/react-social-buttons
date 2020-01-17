import React from 'react';
// import SocialButton from './Microsoft/MicrosoftSocialButton';
import SocialButton from './Google/GoogleSocialButton';

function App() {
  return (
    <SocialButton
      callbackFn={(events) => {
        // Do Stuff
        console.log(events);
      }}
    />
  )
}

export default App;
