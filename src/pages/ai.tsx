import { useState } from "react";
import { api } from "src/utils/api";



const Ai = () => {


    const getAIres = api.ai.getAIres
    const [query, setQuery] = useState<string>("")
    const [result, setResult] = useState<string>()
    const mutation = api.ai.getAIres.useMutation({
        onSuccess: (e) => {

            setResult(e?.text)
        },
        onError: (e) => {
            console.error(e);

        },
    });


    return (
        <div className="flex artboard mx-auto phone gap-6 flex-col min-h-screen w-full justify-center items-center">
            <input className="input input-bordered" value={query} onChange={(e) => { setQuery(e.target.value) }} ></input>
            <button className="btn" onClick={() => { mutation.mutate({ prompt: query }) }}>Submit</button>
            {result}
        </div>
    );
}

export default Ai;