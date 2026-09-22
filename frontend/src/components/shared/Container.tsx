import { cn } from "cn";
import { ReactNode } from "react";
type TProps = { children: ReactNode, className?: string }

const Container = ({ children, className }: TProps) => {
    return (
        <div className={cn("px-6 max-w-360 mx-auto w-full", className)}>
            {children}
        </div>
    );
}

export default Container;
