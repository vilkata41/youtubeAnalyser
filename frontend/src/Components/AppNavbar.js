import {Link, Outlet} from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import "../Styles/Components/Navbar.scss";
import SessionRenewer from "./SessionRenewer";

/**
 * The navbar component containing links to different pages within the application.
 * @returns {JSX.Element} - the navbar component that is generated once a user is properly authenticated.
 */
export default function AppNavbar(){
    return(
        <>
            <nav>
                {/* The session renewer is hidden within the navbar, because the navbar persists across the entire
                 application, and once the timer for the reminder runs out, a session renewer needs to be shown
                 to the user. */}
                <SessionRenewer/>
                {/* Links to pages are specified. */}
                <ul>
                    <li><Link to={"/"}> <span>Dashboard</span>  </Link></li>
                    <li><Link to={"/videos"}> <span>Videos</span> </Link></li>
                    <li><Link to={"/subscribers"}> <span>Subscribers</span> </Link></li>
                </ul>
                {/* Besides the links to pages, a profile settings popup (which is a custom component)
                 is instantiated. */}
                <ProfileSettings />
            </nav>
            {/* Adding an outlet here is important since the navbar has children - the pages within the application.
             Since the navbar is in the root of the React Browser Router specified within the App component, its children
              also need to be rendered besides it. That is exactly what outlet does - it renders the current element,
              as well as any Router children it may currently have.*/}
            <Outlet />
        </>
    );
}