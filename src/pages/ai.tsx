import { useState } from "react";
import { api } from "src/utils/api";



const Ai = () => {



    const [query, setQuery] = useState<string>("")
    const [result, setResult] = useState<string>()
    const [loading, setLoading] = useState(false);
    const mutation = api.ai.getAIres.useMutation({
        onSuccess: (e) => {

            setResult(e?.text)
            setLoading(false)
        },
        onError: (e) => {
            console.error(e);
            setLoading(false)
        },
    });


    return (
        <div className="flex artboard mx-auto phone gap-6 flex-col min-h-screen w-full justify-center items-center">
            <input className="input input-bordered" value={query} onChange={(e) => { setQuery(e.target.value) }} ></input>
            <button className={`btn-primary btn
              ${loading ? "btn-disabled" : ""}}`} onClick={() => {
                    setLoading(true)
                    mutation.mutate({ prompt: query })
                }}>Submit</button>
            {result}
        </div>
    );
}

export default Ai;