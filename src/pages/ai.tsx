import { useState } from "react";
import { api } from "src/utils/api";



const Ai = () => {

    const getAIres = api.ai.getAIres
    const [query, setQuery] = useState<string>("")
    // const [result, setResult] = useState<any>()
    const submit = () => {
        // setResult(data)
        console.log(getAIres.useQuery())
    }

    return (
        <div>
            <input value={query} onChange={(e) => { setQuery(e.target.value) }} ></input>
            <button onClick={() => { submit() }}>Submit</button>
        </div>
    );
}

export default Ai;