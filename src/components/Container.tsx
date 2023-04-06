import { useRouter } from "next/router";
import { type PropsWithChildren } from "react";
const Container = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-32">
      {children}
    </div>
  );
};

export default Container;
