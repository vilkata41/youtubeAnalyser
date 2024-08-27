import "../Styles/Components/ProgressBar.scss";

/**
 * A reusable component that creates a progress bar based on the progress provided to it
 * @param props - holds a progress attribute which is a string representing a percentage. E.g. "44%".
 * It specifies how much the progress bar ought to be filled.
 * @returns {JSX.Element} - a progress bar component filled as much as the "progress" prop attribute specifies it.
 */
export default function ProgressBar(props){
    // Accessing the necessary progress percentage.
    const progress = props.progress;

    return(
        <div className={"progressBarContainer"}>
            {/* The width of the progress div within the container is specified based on the progress provided. */}
            <div className={"currentProgress"} style={{width: progress}}/>
        </div>
    );
}