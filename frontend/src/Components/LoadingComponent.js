import "../Styles/Components/Loading.scss";
import loadingWheel from "../Media/loading.png";
import {useEffect, useState} from "react";

/**
 * This component is purely visual and provides further knowledge to the user.
 * @returns {JSX.Element} - a loading component (a spinning wheel).
 */
export default function LoadingComponent(){
    // The hooks we use are helpful for adding more information to the loading.
    const [isParaVisible, setParaVisible] = useState(false);

    /* Upon loading of the component, if it has existed for over 1 second, that is, if a component using the loader
    * has been loading for over 1 second, an additional paragraph is presented. */
    useEffect(() => {
        setTimeout(() => {
            setParaVisible(true);
        }, 1000);
    });

    return(
        <div className={"loadingComponent"}>
            <img className={"rotating"} src={loadingWheel} alt={"loading component"}/>
            {isParaVisible ?
                // if the paragraph visibility state hook is true, the paragraph is shown.
                <p>
                Please wait while we analyse your stunning 😲 videos...
                </p>
                : // Otherwise, no additional paragraph is presented.
                ""}
        </div>
    );
}