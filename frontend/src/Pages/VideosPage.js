import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import LoadingComponent from "../Components/LoadingComponent";
import "../Styles/Pages/VideosPage.scss";
import backArrow from "../Media/Arrow_left.png";
import nextArrow from "../Media/Arrow_right.png";

/**
 * The page which shows videos of the channel, sorted by recency, 10 per page.
 * @returns {JSX.Element} - a component containing at most 10 videos per page, alongside a way to change the page.
 */
export default function VideosPage(){
    // Initially, all hooks needed are initialised - some to null, others from session storage.
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);

    /* With the use of state and session storage, instead of sending the user to the first page of their videos, we
    *  land on the last visited one by them (for this session) to make their experience smoother.
    *  The default page is the first one.
    */
    const [pagenum, setPagenum] = useState(sessionStorage.getItem("lastVisitedPageNum") ?
        Number (sessionStorage.getItem("lastVisitedPageNum")) :
        1);
    const [prevPageID, setPrevPageID] = useState(null);
    // Additionally to the last visited page number, we need the last visited page ID for proper back-end queries.
    const [currPageID, setCurrPageID] = useState(sessionStorage.getItem("lastVisitedPageID"));
    const [nextPageID, setNextPageID] = useState(null);
    const [pageVideos, setPageVideos] = useState(null);

    /* Upon the component loading, if the user is authenticated AND the video list state hook hasn't been instantiated
    * yet, a new query to the back-end needs to be performed to get the appropriate videos for the specific page. */
    useEffect(() => {
        if(sessionStorage.getItem("isAuthenticated") === "true") {
            setLoading(false);

            if (!pageVideos) {
                setLoading(true);
                /* The URL for the fetch call is specified by the environment values which could be easily changed
                * upon back-end deployment location change, and is also secure by not giving attackers sufficient
                * location information for the back-end. */
                fetch(process.env.REACT_APP_BACKEND_ROOT + "/allVideos", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        token: JSON.parse(sessionStorage.getItem("token")),
                        page_token: currPageID
                    })
                })
                    .then(resp => {
                        if (resp.ok) return resp.json();
                    })
                    .then(data => {
                        // If the response was OK, the necessary data is stored to the states needed.
                        setPrevPageID(data.prevPageToken);
                        setNextPageID(data.nextPageToken);
                        setPageVideos(data.videos);
                        setLoading(false);
                    })
                    .catch(() => {
                        // If a problem occurred, the user is redirected to the error page.
                            sessionStorage.clear();
                            navigate("/error");
                            setLoading(false);
                        }
                    );
            }
        }
        else{
            // If the user is not properly authenticated, they are redirected to the sign-in page.
            sessionStorage.clear();
            navigate("/signin", {replace:true});
        }
        // Upon change of the specified state hooks, the component needs to be re-rendered to visualise them.
    }, [prevPageID, nextPageID, currPageID, navigate, pageVideos]);
        

    /* The prevPage function is a handler for the back button. If the user is on any page other than the first one,
    * their current page ID state is changed to the previous page's ID, and so is the page number.
    * Storing the last visited page (which is now the newly changed one) number and ID is important for
    * page memorisation by the app. */
    const prevPage = () => {
        if(pagenum - 1 > 0){
            setCurrPageID(prevPageID);
            // page videos have to be reset, so that the new page's videos are queried and presented to the user.
            setPageVideos(null);
            setPagenum(pagenum - 1);
            sessionStorage.setItem("lastVisitedPageNum", pagenum-1);
            sessionStorage.setItem("lastVisitedPageID",prevPageID);
            setLoading(true);
        }
        else{
            console.log("Back button - disabled.");
        }
    }

    /* The nextPage function is a handler for the next page button. If there exists a next page (e.g. the next page ID
    * value returned by the back-end is not null), the current page ID state is changed to the next page's ID,
    * and so is the page number. Storing the last visited page (which is now the newly changed one)
    * number and ID is important for page memorisation by the app. */
    const nextPage = () => {
        if(nextPageID !== null){
            setCurrPageID(nextPageID);
            // page videos have to be reset, so that the new page's videos are queried and presented to the user.
            setPageVideos(null);
            setPagenum(pagenum + 1);
            sessionStorage.setItem("lastVisitedPageNum", pagenum+1);
            sessionStorage.setItem("lastVisitedPageID",nextPageID);
            setLoading(true);
        }
        else {
            console.log("Next button - disabled.");
        }
    }
    return(
        <>
            {/* If the query results have not yet been received, provide loading information to the user. */}
            {isLoading ? <LoadingComponent /> : // Otherwise, provide the listing of videos for the current page.
            <div id={"videos"}>
                <h1>Your Videos</h1>
                {/* The page navigator is added both on top and bottom of this page. It contains the buttons
                 that change the current page. */}
                <div className={"vidPageNavigator"}>
                    <div className={"pageChangeButton"} onClick={() => prevPage()}>
                        <img src={backArrow} alt={"back button"}/>
                    </div>
                    <div className={"paginationNum"}>
                        Page {pagenum}
                    </div>
                    <div className={"pageChangeButton"} onClick={() => nextPage()}>
                        <img src={nextArrow} alt={"next button"}/>
                    </div>
                </div>
                <br />
                {pageVideos.map(video => {
                    /* All videos are presented in a nearly identical visual manner. The only differences
                    * are their ID, Title, thumbnail, and privacy status. Using a map() function is an easy way
                    * to create similar objects with the only variations being the specific information included
                    * in those objects. */
                    return(
                        /* Upon each video object being clicked, the user is navigated to a URL utilising the
                        * params value of ":id", specified in the App component. Since that is different for each
                        * video, every video has its own unique analysis page URL. */
                        <div className={"singleVideo"} key={video.videoID} onClick={() => {navigate("/video/"+video.videoID)}}>
                            <img src={video.thumbnailURL} alt={"thumbnail"}/>
                            <p>{video.title}</p>
                            <h4>{video.privacy}</h4>
                        </div>
                    );
                })}
                <br/>
                {/* The page navigator is added both on top and bottom of this page. It contains the buttons
                 that change the current page. */}
                <div className={"vidPageNavigator"}>
                    <div className={"pageChangeButton"} onClick={() => prevPage()}>
                        <img src={backArrow} alt={"back button"}/>
                    </div>
                    <div className={"paginationNum"}>
                        Page {pagenum}
                    </div>
                    <div className={"pageChangeButton"} onClick={() => nextPage()}>
                        <img src={nextArrow} alt={"next button"}/>
                    </div>
                </div>
            </div>

            }
        </>
    );

}