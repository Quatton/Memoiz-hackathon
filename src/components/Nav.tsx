import Link from "next/link";
import { UserCard } from "./user_card";
import { GiNotebook } from "react-icons/gi";
import { BsChatFill } from "react-icons/bs";
import { useRouter } from "next/router";

const Links = ({ path }: { path: string }) => {
    return <>
        <li>
            <Link href={'/chat'} className={`${path === '/chat' ? 'text-accent' : ''}`}>

                Chat <BsChatFill size={22} />
            </Link>
        </li>
        <li>
            <Link href={'/diary'} className={`${path === '/diary' ? 'text-accent' : ''}`}>
                Diary <GiNotebook size={24} />
            </Link>
        </li></>
}

const Nav = () => {
    const router = useRouter()
    const path = router.pathname

    return (
        <div className="navbar bg-base-300 top-0 fixed z-50 md:px-5 shadow-md">
            <div className="navbar-start">
                <div className="dropdown md:hidden">
                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-300 rounded-box">
                        <Links path={path} />
                    </ul>
                </div>

                <Link href={'/'} className="btn btn-ghost normal-case text-3xl pb-1 mr-4 font-logo  "><span className="bg-gradient-to-r bg-clip-text text-transparent from-purple-500 to-pink-500">Memoiz</span></Link>

                <div className="hidden md:block flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <Links path={path} />
                    </ul>
                </div>
            </div>
            {/* <div className="logo navbar-start text-3xl font-semibold">Diary</div> */}



            <div className="navbar-end gap-2">
                <UserCard />
            </div>
        </div>
    );
};

export default Nav;
