import Link from "next/link";
import { UserCard } from "./user_card";
import { GiNotebook } from "react-icons/gi";
import { BsChatFill } from "react-icons/bs";

const Nav = () => {
    return (
        <div className="navbar bg-base-300 top-0 fixed z-50 px-5 shadow-md">
            <div className="navbar-start">
                <Link href={'/'} className="btn btn-ghost normal-case text-3xl pb-1 mr-4 font-logo bg-gradient-to-r bg-clip-text text-transparent from-purple-500 to-pink-500 text">Memoiz</Link>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <Link href={'/chat'}>
                                Chat <BsChatFill size={22} />
                            </Link>
                        </li>
                        <li>
                            <Link href={'/diary'}>
                                Diary <GiNotebook size={24} />
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            {/* <div className="logo navbar-start text-3xl font-semibold">Diary</div> */}



            <div className="navbar-end gap-2">
                <UserCard />
            </div>

        </div>
    );
}

export default Nav;