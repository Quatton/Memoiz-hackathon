
import { useRouter } from "next/router";
import { type PropsWithChildren } from "react";
const Container = ({ children }: PropsWithChildren) => {
    const router = useRouter()
    console.log(router.basePath)
    return (
        <div className="flex w-screen min-h-screen py-32 flex-col items-center justify-center">
            {children}
        </div >
    );
}

export default Container;