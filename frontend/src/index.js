import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import {GoogleOAuthProvider} from "@react-oauth/google";

/**
 * This element is linked to the index HTML file which initialises the entire application.
 * We use 3 wrappers, generate the App component and call the render() function to start up the react app.
 * @type {Root} - the root of the entire react application.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    //The first wrapper makes the entire app run in strict mode.
  <React.StrictMode>
      {/*The second wrapper provides the OAuth service for the entire app, it is important
      that this wraps everything that has to be authenticated and authorised. Client ID is specified from
      environment variables, implying it can never be seen by attackers (or just users) and would be easily
      modified if a change was required. */}
      <GoogleOAuthProvider clientId={process.env.REACT_APP_OAUTH_CLIENT_ID}>
          {/*The third wrapper sets up the base for the browser router used by the app to simulate
          routes within the browser and allocate specific components to specific paths.*/}
          <BrowserRouter basename={"/~jwb20147/honsProject888"}>
              {/*The App component contains all routes and pages that this application is made up of.*/}
              <App />
          </BrowserRouter>
      </GoogleOAuthProvider>
   </React.StrictMode>
);

reportWebVitals();
