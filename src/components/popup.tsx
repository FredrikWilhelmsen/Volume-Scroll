import * as React from "react"; 
import * as ReactDOM from "react-dom"; 

//This is our counter component 
const Counter = () => {
    const [ count, setCount ] = React.useState(0);
    return <>
        <h2>{count}</h2>
        <button onClick={() => {setCount(count + 1)}}>increment</button>
        <button onClick={() => {setCount(count - 1)}}>decrement</button>
    </>
}

ReactDOM.render(<Counter />, document.getElementById("root"));