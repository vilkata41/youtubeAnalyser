import errorGif from "../Media/computer_in_bin.gif";
import "../Styles/Pages/NotFoundPage.scss";

/**
 * Simple not found component. Routed to by the App component if a page is not found.
 * @returns {JSX.Element} - a 404 Error page component.
 */
export default function NotFound(){
    return(
        <div id={"errorPage"}>
            <h1>404 Error</h1>
            <h2>Page Not Found</h2>
            <hr/>
            <p>We are sorry, but the page you're looking for doesn't seem to exist...</p>
            <img src={errorGif} alt={"error gif"}/>
        </div>
    );
}
