import Link from "next/link";
import { UserCard } from "./user_card";

const Nav = ({ breads }: { breads: { title: string, path: string }[] }) => {
    return (
        <div className="navbar bg-base-300 top-0 fixed z-50 px-5 shadow-md">
            <Link href={'/'} className="btn btn-ghost normal-case text-3xl pb-1 mr-4 font-logo">Memoiz</Link>
            {/* <div className="logo navbar-start text-3xl font-semibold">Diary</div> */}

            <div className="text-sm breadcrumbs navbar-start">
                <ul>
                    {
                        breads && breads.map((bread, idx) => {
                            return <li key={`bread-${idx}`} >
                                <Link href={bread.path}>{bread.title}</Link>
                            </li>
                        })
                    }
                </ul>
            </div>


            <div className="navbar-end gap-2">
                <UserCard />
            </div>

        </div>
    );
}

export default Nav;