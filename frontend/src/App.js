import './Styles/App.scss';
import {Route, Routes, useNavigate} from "react-router-dom";
import SignInPage from "./Pages/SignInPage";
import DashboardPage from "./Pages/DashboardPage";
import VideosPage from "./Pages/VideosPage";
import SubscribersPage from "./Pages/SubscribersPage";
import NotFound from "./Components/NotFound";
import AppNavbar from "./Components/AppNavbar";
import VideoAnalysisPage from "./Pages/VideoAnalysisPage";
import ErrorPage from "./Pages/ErrorPage";
import {useEffect} from "react";

/**
 * This is the entire application component, containing all pages, routes, and page sub-components.
 * @returns {JSX.Element} - the App div which is instantiated in the index.js javascript file.
 */
function App() {

    /*
        Setting up the navigate hook that will be used when the app is navigated anywhere to one of the specified
        Browser Router paths.
    */
    const navigate = useNavigate();

    useEffect(() => {
        if(sessionStorage.getItem("tokenExpiryTime") && sessionStorage.getItem("reminderPopUpTime")){

            // Resetting the timeouts if there are any, and they will have the same deadline as they had before
            setTimeout(() => {
                sessionStorage.clear();
                navigate("/signin");
            }, sessionStorage.getItem("tokenExpiryTime") - Date.now());

            setTimeout(() => {
                document.getElementById("sessionRenewerContainer").style.display = "grid";
            }, sessionStorage.getItem("reminderPopUpTime") - Date.now());
        }
    });

  return (
    <div className="App">
        {/*The Routes are specified to all the pages used within the application.
        If the user tries to reach a page that is not part of the app, they are navigated to the NotFound page.*/}
        <Routes>
            {/*the first route is located outside the application.*/}
            <Route path={"/signin"} element={<SignInPage />} />
            {/*The second route acts as a root for all other routes used in the app, when the user is logged in.
            All pages act as children of the navbar, because the navbar is only instantiated once the
            user is properly authenticated, and each page needs to have the navbar.*/}
            <Route path={"/"} element={<AppNavbar />} >
                {/*The dashboard acts as the index element, and the rest have specific routes.*/}
                <Route index element={<DashboardPage />} />
                <Route path={"/videos"} element={<VideosPage />} />
                {/*The id used here is called a "router parameter" which is later used by the component
                VideoAnalysisPage to analyse the specific video which ID is provided in the URL path specified.*/}
                <Route path={"/video/:id"} element={<VideoAnalysisPage />} />
                <Route path={"/subscribers"} element={<SubscribersPage />} />
                <Route path={"/error"} element={<ErrorPage />} />
            </Route>
            <Route path={"*"} element={<NotFound />} />
        </Routes>
    </div>
  );
}

export default App;
