import { type PropsWithChildren } from "react";
const Container = ({ children }: PropsWithChildren) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-start pt-24">
            {children}
        </div>
    );
};

export default Container;
