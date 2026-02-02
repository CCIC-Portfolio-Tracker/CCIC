import {useState} from "react";

function OurComponent() {
    const[strawberries, setStrawberries] = useState(0);

    function handleClick() {
        setStrawberries((prev) => prev + 1);
    }

    return (
        <div>
            <h3>Our Cool Component</h3>
            <p>there are {strawberries} strawberries</p>
            <button onClick={handleClick}>Increase strawberries</button>
        </div>
    )
}

export default OurComponent;